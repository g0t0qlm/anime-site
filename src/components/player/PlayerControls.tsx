// src/components/player/PlayerControls.tsx
'use client';

import { RefObject } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, Settings, ChevronRight,
} from 'lucide-react';
import { SkipTime } from '@/types';
import { formatTime } from '@/lib/utils';

interface PlayerControlsProps {
  videoRef: RefObject<HTMLVideoElement>;
  isVisible: boolean;
  isPlaying: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  currentQuality: string;
  availableQualities: string[];
  skipTimes: SkipTime[];
  episodeNumber: number;
  totalEpisodes?: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (v: number) => void;
  onMute: () => void;
  onQualityChange: (q: string) => void;
  onFullscreen: () => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

export default function PlayerControls({
  isVisible, isPlaying, isFullscreen,
  currentTime, duration, volume, isMuted,
  currentQuality, availableQualities, skipTimes,
  episodeNumber, totalEpisodes,
  onTogglePlay, onSeek, onVolumeChange, onMute,
  onQualityChange, onFullscreen, onNextEpisode, onPrevEpisode,
}: PlayerControlsProps) {
  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Позиции зон скипа на прогресс-баре
  const introSkip = skipTimes.find(s => s.skipType === 'op' || s.skipType === 'mixed-op');
  const outroSkip = skipTimes.find(s => s.skipType === 'ed' || s.skipType === 'mixed-ed');

  const getSkipZoneStyle = (skip: SkipTime) => ({
    left: `${(skip.interval.startTime / duration) * 100}%`,
    width: `${((skip.interval.endTime - skip.interval.startTime) / duration) * 100}%`,
  });

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div
      className={`
        player-controls z-20 transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      {/* Прогресс-бар */}
      <div className="mb-3">
        {/* Превью времени при наведении можно добавить */}
        <div
          className="progress-bar group/bar"
          onClick={handleProgressClick}
        >
          {/* Зоны скипа */}
          {duration > 0 && introSkip && (
            <div
              className="skip-zone"
              style={getSkipZoneStyle(introSkip)}
              title="Опенинг"
            />
          )}
          {duration > 0 && outroSkip && (
            <div
              className="skip-zone"
              style={getSkipZoneStyle(outroSkip)}
              title="Эндинг"
            />
          )}

          {/* Буфер */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-white/20"
            style={{ width: `${progress + 5}%` }}
          />

          {/* Прогресс */}
          <div className="progress-filled" style={{ width: `${progress}%` }}>
            {/* Ручка прогресса */}
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2
                         w-4 h-4 rounded-full bg-white shadow-lg
                         opacity-0 group-hover/bar:opacity-100 transition-opacity
                         scale-0 group-hover/bar:scale-100"
            />
          </div>
        </div>

        {/* Время */}
        <div className="flex justify-between mt-1.5 text-xs text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex items-center gap-1">
        {/* Предыдущая серия */}
        <button
          onClick={onPrevEpisode}
          disabled={episodeNumber <= 1}
          className="p-2.5 text-slate-400 hover:text-white transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
          title="Предыдущая серия [P]"
        >
          <SkipBack size={18} />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 
                     text-white transition-all hover:scale-105"
          title="Воспроизвести/Пауза [Space]"
        >
          {isPlaying
            ? <Pause size={20} fill="white" />
            : <Play size={20} fill="white" />
          }
        </button>

        {/* Следующая серия */}
        <button
          onClick={onNextEpisode}
          disabled={totalEpisodes !== undefined && episodeNumber >= totalEpisodes}
          className="p-2.5 text-slate-400 hover:text-white transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
          title="Следующая серия [N]"
        >
          <SkipForward size={18} />
        </button>

        {/* Громкость */}
        <div className="flex items-center gap-2 ml-2 group/vol">
          <button
            onClick={onMute}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Mute [M]"
          >
            {isMuted || volume === 0
              ? <VolumeX size={18} />
              : <Volume2 size={18} />
            }
          </button>
          
          {/* Слайдер громкости — появляется при наведении */}
          <div className="w-0 group-hover/vol:w-24 overflow-hidden transition-all duration-200">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="volume-slider w-24"
              style={{
                background: `linear-gradient(to right, #7c3aed ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 0%)`,
              }}
            />
          </div>
        </div>

        {/* Спейсер */}
        <div className="flex-1" />

        {/* Выбор качества */}
        {availableQualities.length > 0 && (
          <QualityMenu
            current={currentQuality}
            options={availableQualities}
            onChange={onQualityChange}
          />
        )}

        {/* Полный экран */}
        <button
          onClick={onFullscreen}
          className="p-2.5 text-slate-400 hover:text-white transition-colors"
          title="Полный экран [F]"
        >
          {isFullscreen
            ? <Minimize size={18} />
            : <Maximize size={18} />
          }
        </button>
      </div>
    </div>
  );
}

// Компонент выбора качества
function QualityMenu({
  current, options, onChange,
}: {
  current: string;
  options: string[];
  onChange: (q: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                   text-xs font-medium text-slate-300 hover:text-white
                   bg-white/5 hover:bg-white/10 transition-all"
      >
        <Settings size={14} />
        {current || 'Авто'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 z-40
                          bg-[#1a1a2e] border border-white/10 rounded-xl
                          overflow-hidden shadow-2xl min-w-[120px]">
            {options.map(q => (
              <button
                key={q}
                onClick={() => { onChange(q); setOpen(false); }}
                className={`
                  w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${current === q
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {q === 'Авто' ? '🎯 Авто' : `📺 ${q}`}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Нужен useState в QualityMenu
import { useState } from 'react';