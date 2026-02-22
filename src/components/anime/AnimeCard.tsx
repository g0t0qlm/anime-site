// src/components/anime/AnimeCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, Bookmark } from 'lucide-react';
import { usePlayerStore } from '@/lib/store/playerStore';

interface AnimeCardProps {
  item: any;
  showEpisode?: boolean;
}

export default function AnimeCard({ item, showEpisode }: AnimeCardProps) {
  const { isBookmarked, toggleBookmark } = usePlayerStore();
  const bookmarked = isBookmarked(item.id?.toString());

  const title = item.title?.english || item.title?.romaji || item.title;
  const cover = item.coverImage?.extraLarge || item.coverImage?.large || item.image;
  const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : null;
  const animeId = item.id?.toString() || item.id;

  return (
    <div className="anime-card">
      {/* Постер */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500
                       group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[var(--bg-hover)] flex items-center justify-center">
            <span className="text-4xl">🎌</span>
          </div>
        )}

        {/* Оверлей при наведении */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        flex flex-col justify-end p-4">
          <Link href={`/watch/${animeId}/1`}>
            <button className="w-full flex items-center justify-center gap-2
                               bg-violet-600 hover:bg-violet-500 text-white
                               py-2.5 rounded-lg font-medium text-sm transition-colors mb-2">
              <Play size={15} fill="white" />
              Смотреть
            </button>
          </Link>
          <Link href={`/anime/${animeId}`}>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white
                               py-2 rounded-lg text-sm transition-colors">
              Подробнее
            </button>
          </Link>
        </div>

        {/* Рейтинг */}
        {score && (
          <div className="absolute top-2 left-2 flex items-center gap-1
                          bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg
                          text-xs font-bold text-yellow-400">
            <Star size={11} fill="currentColor" />
            {score}
          </div>
        )}

        {/* Статус ongoing */}
        {item.status === 'Ongoing' && (
          <div className="absolute top-2 right-2 bg-violet-600/90 text-white
                          text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm">
            Онгоинг
          </div>
        )}

        {/* Серия (для last episodes) */}
        {showEpisode && item.episodeNumber && (
          <div className="absolute bottom-2 left-2 bg-black/80 text-white
                          text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
            Серия {item.episodeNumber}
          </div>
        )}
      </div>

      {/* Инфо */}
      <div className="p-3">
        <Link href={`/anime/${animeId}`}>
          <h3 className="font-semibold text-white text-sm line-clamp-2 
                         hover:text-violet-300 transition-colors leading-tight">
            {title}
          </h3>
        </Link>
        {item.seasonYear && (
          <p className="text-slate-500 text-xs mt-1">{item.seasonYear}</p>
        )}
      </div>
    </div>
  );
}