// src/components/anime/AnimeGrid.tsx
import AnimeCard from './AnimeCard';

interface AnimeGridProps {
  items: any[];
  showEpisode?: boolean;
}

export default function AnimeGrid({ items, showEpisode }: AnimeGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        Ничего не найдено
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item, i) => (
        <AnimeCard key={item.id || i} item={item} showEpisode={showEpisode} />
      ))}
    </div>
  );
}