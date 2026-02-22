// src/components/anime/HeroBanner.tsx
'use client';

import Link from 'next/link';
import { Play, Info, Star } from 'lucide-react';

export default function HeroBanner({ anime }: { anime: any }) {
  if (!anime) return null;

  const title = anime.title?.english || anime.title?.romaji || anime.title;
  const banner = anime.bannerImage || anime.coverImage?.extraLarge;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const desc = anime.description?.replace(/<[^>]*>/g, '').slice(0, 200);

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      {/* Фон */}
      {banner && (
        <img
          src={banner}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Градиент */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-transparent to-transparent" />

      {/* Контент */}
      <div className="relative h-full max-w-screen-2xl mx-auto px-6 flex items-end pb-20">
        <div className="max-w-2xl">
          {/* Рейтинг */}
          {score && (
            <div className="flex items-center gap-1.5 mb-4">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">{score}</span>
              <span className="text-slate-500 text-sm">/ 10</span>
            </div>
          )}

          {/* Название */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>

          {/* Жанры */}
          {anime.genres && (
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.slice(0, 4).map((g: string) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs font-medium
                             bg-white/10 text-slate-300 border border-white/10"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Описание */}
          {desc && (
            <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
              {desc}...
            </p>
          )}

          {/* Кнопки */}
          <div className="flex items-center gap-3">
            <Link href={`/watch/${anime.id}/1`}>
              <button className="btn-primary flex items-center gap-2">
                <Play size={16} fill="white" />
                Смотреть
              </button>
            </Link>
            <Link href={`/anime/${anime.id}`}>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg
                                 bg-white/10 hover:bg-white/20 text-white
                                 border border-white/10 transition-all font-medium">
                <Info size={16} />
                Подробнее
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}