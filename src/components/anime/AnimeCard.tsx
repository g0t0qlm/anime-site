// src/components/anime/AnimeCard.tsx
'use client';

import Link from 'next/link';
import { Play, Star } from 'lucide-react';

export default function AnimeCard({ item, showEpisode }: { item: any; showEpisode?: boolean }) {
  const title = item.title?.english || item.title?.romaji || item.title;
  const cover = item.coverImage?.extraLarge || item.coverImage?.large || item.image;
  const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : null;
  const id = item.id?.toString();

  return (
    <div className="anime-card group">
      <div className="relative aspect-[3/4] overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl"
               style={{ background: 'var(--bg-hover)' }}>
            🎌
          </div>
        )}

        {/* Оверлей */}
        <div className="absolute inset-0 flex flex-col justify-end p-3
                        bg-gradient-to-t from-black/90 via-black/20 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link href={`/watch/${id}/1`}>
            <button className="w-full flex items-center justify-center gap-2
                               bg-violet-600 hover:bg-violet-500 text-white
                               py-2 rounded-lg font-medium text-sm transition-colors mb-1.5">
              <Play size={14} fill="white" />
              Смотреть
            </button>
          </Link>
          <Link href={`/anime/${id}`}>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white
                               py-1.5 rounded-lg text-xs transition-colors">
              Подробнее
            </button>
          </Link>
        </div>

        {/* Рейтинг */}
        {score && (
          <div className="absolute top-2 left-2 flex items-center gap-1
                          bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold"
               style={{ color: '#fbbf24' }}>
            <Star size={10} fill="currentColor" />
            {score}
          </div>
        )}

        {/* Статус */}
        {item.status === 'Ongoing' && (
          <div className="absolute top-2 right-2 bg-violet-600/90 text-white
                          text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
            Онгоинг
          </div>
        )}

        {showEpisode && item.episodeNumber && (
          <div className="absolute bottom-2 left-2 bg-black/80 text-white
                          text-xs px-2 py-1 rounded-lg">
            Серия {item.episodeNumber}
          </div>
        )}
      </div>

      <div className="p-3">
        <Link href={`/anime/${id}`}>
          <h3 className="font-semibold text-sm line-clamp-2 hover:text-violet-300 
                         transition-colors leading-tight"
              style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </Link>
        {item.seasonYear && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {item.seasonYear}
          </p>
        )}
      </div>
    </div>
  );
}