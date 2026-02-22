// src/components/player/VideoPlayer.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { SkipTime, VideoSource, SubtitleTrack } from '@/types';
import { getIntroInterval, getOutroInterval } from '@/lib/api/aniskip';
import PlayerControls from './PlayerControls';
import { usePlayerStore } from '@/lib/store/playerStore';

interface VideoPlayerProps {
  sources: VideoSource[];
  subtitles?: SubtitleTrack[];
  skipTimes: SkipTime[];
  episodeTitle?: string;
  animeTitle: string;
  animeId: string;
  episodeNumber: number;
  totalEpisodes?: number;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  onTimeUpdate?: (time: number) => void;
  initialTime?: number;
}

export default function VideoPlayer({
  sources,
  subtitles = [],
  skipTimes,
  episodeTitle,
  animeTitle,
  animeId,
  episodeNumber,
  totalEpisodes,
  onNextEpisode,
  onPrevEpisode,
  onTimeUpdate,
  initialTime = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressSaveRef = useRef<ReturnType<typeof setInterval>>();
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();

  // Store
  const { settings, updateWatchProgress, setVolume, volume, isMuted, setMuted } = usePlayerStore();

  // Стейт плеера
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>('');
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Скип
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState<number | null>(null);

  // Получаем HLS источник
  const hlsSource = sources.find(s => s.isM3U8)?.url || sources[0]?.url;

  // ═══════════════════════════════════
  // ИНИЦИАЛИЗАЦИЯ HLS
  // ═══════════════════════════════════
  const initHls = useCallback((src: string) => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Чистим старый инстанс
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    // Нативный HLS (Safari)
    if (!Hls.isSupported() && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.load();
      return;
    }

    if (!Hls.isSupported()) {
      setError('HLS не поддерживается в этом браузере');
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      maxBufferLength: 60,
      maxMaxBufferLength: 120,
      progressive: true,
      startLevel: -1, // Авто выбор качества
    });

    hlsRef.current = hls;

    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      // Получаем список доступных качеств
      const qualities = hls.levels.map(l => `${l.height}p`);
      setAvailableQualities(['Авто', ...qualities]);

      // Начинаем с максимального качества
      if (settings.defaultQuality !== 'Авто') {
        const targetLevel = hls.levels.findIndex(
          l => `${l.height}p` === settings.defaultQuality
        );
        if (targetLevel !== -1) hls.currentLevel = targetLevel;
      }

      setIsLoading(false);

      // Восстанавливаем позицию
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }

      if (settings.autoPlay) {
        video.play().catch(() => {});
      }
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      const level = hls.levels[data.level];
      setCurrentQuality(level ? `${level.height}p` : 'Авто');
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            setError('Ошибка загрузки видео. Попробуйте другой сервер.');
            break;
        }
      }
    });

    return () => {
      hls.destroy();
    };
  }, [initialTime, settings.autoPlay, settings.defaultQuality]);

  // ═══════════════════════════════════
  // ИНИЦИАЛИЗАЦИЯ СУБТИТРОВ
  // ═══════════════════════════════════
  const initSubtitles = useCallback(() => {
    const video = videoRef.current;
    if (!video || subtitles.length === 0) return;

    // Удаляем старые треки
    Array.from(video.textTracks).forEach(track => {
      (track as any).mode = 'disabled';
    });

    subtitles.forEach((sub, i) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = sub.label;
      track.srclang = sub.lang;
      track.src = sub.url;
      if (i === 0) track.default = true;
      video.appendChild(track);
    });
  }, [subtitles]);

  // ═══════════════════════════════════
  // ВЫБОР КАЧЕСТВА
  // ═══════════════════════════════════
  const handleQualityChange = useCallback((quality: string) => {
    const hls = hlsRef.current;
    if (!hls) return;

    if (quality === 'Авто') {
      hls.currentLevel = -1;
    } else {
      const levelIndex = hls.levels.findIndex(l => `${l.height}p` === quality);
      if (levelIndex !== -1) {
        hls.currentLevel = levelIndex;
      }
    }

    setCurrentQuality(quality);
  }, []);

  // ═══════════════════════════════════
  // АВТОСКИП
  // ═══════════════════════════════════
  const handleTimeUpdateForSkip = useCallback(() => {
    const video = videoRef.current;
    if (!video || skipTimes.length === 0) return;

    const time = video.currentTime;
    const intro = getIntroInterval(skipTimes);
    const outro = getOutroInterval(skipTimes);

    // Проверяем опенинг
    if (intro) {
      const { startTime, endTime } = intro.interval;
      if (time >= startTime && time < endTime) {
        setShowSkipIntro(true);
        setShowSkipOutro(false);
        
        if (settings.autoSkipIntro) {
          video.currentTime = endTime;
          showNotification('⏭ Опенинг пропущен');
        }
        return;
      }
    }

    // Проверяем эндинг
    if (outro) {
      const { startTime, endTime } = outro.interval;
      if (time >= startTime && time < endTime) {
        setShowSkipOutro(true);
        setShowSkipIntro(false);
        
        if (settings.autoSkipOutro) {
          // Авто следующая серия если включено
          if (settings.autoNext && onNextEpisode) {
            onNextEpisode();
          } else {
            video.currentTime = endTime;
          }
          showNotification('⏭ Эндинг пропущен');
        }
        return;
      }
    }

    setShowSkipIntro(false);
    setShowSkipOutro(false);
  }, [skipTimes, settings.autoSkipIntro, settings.autoSkipOutro, settings.autoNext, onNextEpisode]);

  // ═══════════════════════════════════
  // СОБЫТИЯ ВИДЕО
  // ═══════════════════════════════════
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => { setIsBuffering(false); setIsLoading(false); };
    const onLoadedMetadata = () => setDuration(video.duration);
    
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      handleTimeUpdateForSkip();
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      if (settings.autoNext && onNextEpisode) {
        setTimeout(onNextEpisode, 1500);
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.volume = isMuted ? 0 : volume;

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, [handleTimeUpdateForSkip, settings.autoNext, onNextEpisode, volume, isMuted]);

  // ═══════════════════════════════════
  // СОХРАНЕНИЕ ПРОГРЕССА
  // ═══════════════════════════════════
  useEffect(() => {
    progressSaveRef.current = setInterval(() => {
      if (videoRef.current && isPlaying) {
        updateWatchProgress(animeId, episodeNumber, videoRef.current.currentTime);
        onTimeUpdate?.(videoRef.current.currentTime);
      }
    }, 5000);

    return () => {
      if (progressSaveRef.current) clearInterval(progressSaveRef.current);
    };
  }, [animeId, episodeNumber, isPlaying, updateWatchProgress, onTimeUpdate]);

  // ═══════════════════════════════════
  // ГОРЯЧИЕ КЛАВИШИ
  // ═══════════════════════════════════
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      
      // Не перехватываем если фокус на инпуте
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - (e.shiftKey ? 30 : 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + (e.shiftKey ? 30 : 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          setMuted(!isMuted);
          break;
        case 'KeyS':
          if (showSkipIntro) skipIntro();
          if (showSkipOutro) skipOutro();
          break;
        case 'KeyN':
          onNextEpisode?.();
          break;
        case 'KeyP':
          onPrevEpisode?.();
          break;
        default:
          // Перемотка на % от длины (клавиши 1-9)
          const num = parseInt(e.key);
          if (num >= 1 && num <= 9) {
            video.currentTime = (video.duration * num) / 10;
          }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [volume, isMuted, showSkipIntro, showSkipOutro, onNextEpisode, onPrevEpisode]);

  // ═══════════════════════════════════
  // ПОЛНЫЙ ЭКРАН
  // ═══════════════════════════════════
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ═══════════════════════════════════
  // СКРЫТИЕ КОНТРОЛОВ
  // ═══════════════════════════════════
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // ═══════════════════════════════════
  // УВЕДОМЛЕНИЕ
  // ═══════════════════════════════════
  const [notification, setNotification] = useState<string | null>(null);
  
  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2500);
  };

  // ═══════════════════════════════════
  // СКИП ФУНКЦИИ
  // ═══════════════════════════════════
  const skipIntro = () => {
    const intro = getIntroInterval(skipTimes);
    if (intro && videoRef.current) {
      videoRef.current.currentTime = intro.interval.endTime;
      setShowSkipIntro(false);
      showNotification('⏭ Опенинг пропущен');
    }
  };

  const skipOutro = () => {
    const outro = getOutroInterval(skipTimes);
    if (outro && videoRef.current) {
      if (onNextEpisode) {
        onNextEpisode();
      } else {
        videoRef.current.currentTime = outro.interval.endTime;
      }
      setShowSkipOutro(false);
      showNotification('⏭ Эндинг пропущен');
    }
  };

  // ═══════════════════════════════════
  // ИНИЦИАЛИЗАЦИЯ
  // ═══════════════════════════════════
  useEffect(() => {
    if (hlsSource) {
      initHls(hlsSource);
      initSubtitles();
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsSource]);

  // Клик по видео — play/pause
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  return (
    <div
      ref={containerRef}
      className="player-container group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* Видео элемент */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={handleVideoClick}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Спиннер загрузки */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="player-spinner" />
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <div className="text-6xl mb-4">😵</div>
          <p className="text-white text-lg font-medium mb-2">{error}</p>
          <p className="text-slate-400 text-sm">Попробуйте выбрать другой сервер</p>
        </div>
      )}

      {/* Уведомление */}
      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 
                        bg-black/80 text-white px-5 py-2.5 rounded-full text-sm
                        backdrop-blur-sm border border-white/10">
          {notification}
        </div>
      )}

      {/* Кнопки скипа */}
      <div className="absolute right-6 bottom-24 z-20 flex flex-col gap-2">
        {showSkipIntro && (
          <button className="skip-button" onClick={skipIntro}>
            Пропустить опенинг →
          </button>
        )}
        {showSkipOutro && (
          <button className="skip-button" onClick={skipOutro}>
            Пропустить эндинг →
          </button>
        )}
      </div>

      {/* Заголовок (верх) */}
      <div
        className={`
          absolute top-0 left-0 right-0 p-5 z-10
          bg-gradient-to-b from-black/80 to-transparent
          transition-opacity duration-300
          ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-white font-semibold">{animeTitle}</p>
            <p className="text-slate-400 text-sm">
              Серия {episodeNumber}{episodeTitle ? ` — ${episodeTitle}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Контролы плеера */}
      <PlayerControls
        videoRef={videoRef}
        isVisible={showControls}
        isPlaying={isPlaying}
        isFullscreen={isFullscreen}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        currentQuality={currentQuality}
        availableQualities={availableQualities}
        skipTimes={skipTimes}
        episodeNumber={episodeNumber}
        totalEpisodes={totalEpisodes}
        onTogglePlay={() => {
          const v = videoRef.current;
          if (v) v.paused ? v.play() : v.pause();
        }}
        onSeek={(time) => {
          if (videoRef.current) videoRef.current.currentTime = time;
        }}
        onVolumeChange={(v) => {
          setVolume(v);
          if (videoRef.current) videoRef.current.volume = v;
        }}
        onMute={() => {
          const newMuted = !isMuted;
          setMuted(newMuted);
          if (videoRef.current) videoRef.current.volume = newMuted ? 0 : volume;
        }}
        onQualityChange={handleQualityChange}
        onFullscreen={toggleFullscreen}
        onNextEpisode={onNextEpisode}
        onPrevEpisode={onPrevEpisode}
      />
    </div>
  );
}