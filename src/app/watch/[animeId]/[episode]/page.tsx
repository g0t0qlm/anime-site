// src/app/watch/[animeId]/[episode]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/player/VideoPlayer';
import EpisodeList from '@/components/player/EpisodeList';
import ServerSelector from '@/components/player/ServerSelector';
import { getAnimeInfo, getEpisodeSources, getEpisodeServers } from '@/lib/api/consumet';
import { getAniListById } from '@/lib/api/anilist';
import { getSkipTimes } from '@/lib/api/aniskip';
import { usePlayerStore } from '@/lib/store/playerStore';

interface PageProps {
  params: Promise<{ animeId: string; episode: string }>;
}

const PROVIDERS = [
  { id: 'zoro', label: 'Zoro (рекомендую)', default: true },
  { id: 'gogoanime', label: 'GogoAnime', default: false },
];

export default function WatchPage({ params }: PageProps) {
  const { animeId, episode } = use(params);
  const episodeNumber = parseInt(episode);
  const router = useRouter();

  const { getWatchProgress, updateWatchProgress } = usePlayerStore();

  const [animeData, setAnimeData] = useState<any>(null);
  const [anilistData, setAnilistData] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [skipTimes, setSkipTimes] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState('zoro');
  const [isLoading, setIsLoading] = useState(true);
  const [initialTime, setInitialTime] = useState(0);

  // ═══════════════════════════════════
  // ЗАГРУЗКА ДАННЫХ
  // ═══════════════════════════════════
  useEffect(() => {
    loadAnimeData();
  }, [animeId, selectedProvider]);

  useEffect(() => {
    if (currentEpisode) {
      loadSources();
    }
  }, [currentEpisode, selectedServer]);

  const loadAnimeData = async () => {
    setIsLoading(true);
    try {
      const data = await getAnimeInfo(animeId, selectedProvider as any);
      setAnimeData(data);
      setEpisodes(data.episodes || []);

      // Находим текущий эпизод
      const ep = data.episodes?.find((e: any) =>
        e.number === episodeNumber
      ) || data.episodes?.[episodeNumber - 1];
      
      setCurrentEpisode(ep);

      // Загружаем AniList метаданные для красивых обложек
      if (data.malId) {
        loadAniListData(data.malId);
        loadSkipTimes(data.malId, episodeNumber);
      }

      // Восстанавливаем прогресс
      const saved = getWatchProgress(animeId);
      if (saved && saved.episode === episodeNumber) {
        setInitialTime(saved.progress);
      }
    } catch (error) {
      console.error('Failed to load anime:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAniListData = async (malId: number) => {
    try {
      // Поиск по MAL ID через AniList
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query ($idMal: Int) {
            Media(idMal: $idMal, type: ANIME) {
              id idMal
              title { romaji english native }
              description
              coverImage { extraLarge color }
              bannerImage
              averageScore genres episodes status
            }
          }`,
          variables: { idMal: malId },
        }),
      });
      const { data } = await response.json();
      setAnilistData(data?.Media);
    } catch {}
  };

  const loadSkipTimes = async (malId: number, ep: number) => {
    const times = await getSkipTimes(malId, ep);
    setSkipTimes(times);
  };

  const loadSources = async () => {
    if (!currentEpisode) return;

    try {
      setIsLoading(true);
      
      // Получаем список серверов если ещё не загружены
      if (servers.length === 0) {
        try {
          const serverList = await getEpisodeServers(currentEpisode.id, selectedProvider);
          setServers(serverList || []);
          if (serverList?.length > 0 && !selectedServer) {
            setSelectedServer(serverList[0].name);
          }
        } catch {}
      }

      const data = await getEpisodeSources(
        currentEpisode.id,
        selectedProvider as any,
        selectedServer || undefined
      );

      // Сортируем по качеству (высшее первым)
      const sortedSources = (data.sources || []).sort((a: any, b: any) => {
        const getHeight = (q: string) => parseInt(q.replace('p', '')) || 0;
        return getHeight(b.quality) - getHeight(a.quality);
      });

      setSources(sortedSources);
      setSubtitles(data.subtitles || []);
    } catch (error) {
      console.error('Failed to load sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════
  // НАВИГАЦИЯ
  // ═══════════════════════════════════
  const handleEpisodeChange = (epNumber: number) => {
    router.push(`/watch/${animeId}/${epNumber}`);
  };

  const handleNextEpisode = () => {
    if (episodeNumber < (episodes.length || 0)) {
      handleEpisodeChange(episodeNumber + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (episodeNumber > 1) {
      handleEpisodeChange(episodeNumber - 1);
    }
  };

  // Обложка
  const coverImage = anilistData?.bannerImage
    || anilistData?.coverImage?.extraLarge
    || animeData?.image;

  const animeTitle = anilistData?.title?.russian
    || anilistData?.title?.english
    || anilistData?.title?.romaji
    || animeData?.title;

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      {/* Фоновый баннер */}
      {coverImage && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src={coverImage}
            alt=""
            className="w-full h-full object-cover opacity-[0.04] blur-xl scale-110"
          />
        </div>
      )}

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 py-6">
        {/* Основной лэйаут */}
        <div className="flex gap-6">
          {/* Левая колонка: плеер */}
          <div className="flex-1 min-w-0">
            {/* Плеер */}
            <div className="rounded-2xl overflow-hidden shadow-2xl
                            border border-white/5">
              {sources.length > 0 ? (
                <VideoPlayer
                  sources={sources}
                  subtitles={subtitles}
                  skipTimes={skipTimes}
                  animeTitle={animeTitle}
                  episodeTitle={currentEpisode?.title}
                  animeId={animeId}
                  episodeNumber={episodeNumber}
                  totalEpisodes={episodes.length}
                  initialTime={initialTime}
                  onNextEpisode={handleNextEpisode}
                  onPrevEpisode={handlePrevEpisode}
                  onTimeUpdate={(time) => {
                    updateWatchProgress(animeId, episodeNumber, time);
                  }}
                />
              ) : (
                <div className="aspect-video bg-[#0d0d18] flex items-center justify-center">
                  <div className="player-spinner" />
                </div>
              )}
            </div>

            {/* Инфо под плеером */}
            <div className="mt-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white mb-1">
                    {animeTitle}
                  </h1>
                  <p className="text-slate-400">
                    Серия {episodeNumber}
                    {currentEpisode?.title && ` — ${currentEpisode.title}`}
                  </p>
                </div>

                {/* Выбор провайдера */}
                <div className="flex gap-2">
                  {PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProvider(p.id);
                        setServers([]);
                        setSelectedServer('');
                      }}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${selectedProvider === p.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }
                      `}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Выбор сервера */}
              {servers.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
                    Серверы
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {servers.map((server: any) => (
                      <button
                        key={server.name}
                        onClick={() => setSelectedServer(server.name)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs transition-all
                          ${selectedServer === server.name
                            ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
                          }
                        `}
                      >
                        {server.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Жанры */}
              {anilistData?.genres && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {anilistData.genres.slice(0, 6).map((g: string) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-lg bg-white/5 
                                 text-slate-400 text-xs border border-white/5"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка: список серий */}
          <div className="w-80 shrink-0 hidden lg:block">
            <EpisodeList
              episodes={episodes}
              currentEpisode={episodeNumber}
              animeId={animeId}
              onEpisodeSelect={handleEpisodeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}