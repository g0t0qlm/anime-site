// src/app/page.tsx
import { getTrendingAniList, searchAniList } from '@/lib/api/anilist';
import { getRecentEpisodes } from '@/lib/api/consumet';
import AnimeGrid from '@/components/anime/AnimeGrid';
import HeroBanner from '@/components/anime/HeroBanner';

export const revalidate = 1800; // Обновляем каждые 30 мин

export default async function HomePage() {
  const [trending, recent] = await Promise.allSettled([
    getTrendingAniList(1, 20),
    getRecentEpisodes(1),
  ]);

  const trendingData = trending.status === 'fulfilled' ? trending.value : [];
  const recentData = recent.status === 'fulfilled' ? recent.value.results : [];
  const featured = trendingData[0];

  return (
    <main>
      {/* Герой-баннер */}
      {featured && <HeroBanner anime={featured} />}

      <div className="max-w-screen-2xl mx-auto px-6 py-12 space-y-16">
        {/* Сейчас смотрят */}
        <section>
          <SectionHeader title="В тренде" subtitle="Самое популярное прямо сейчас" />
          <AnimeGrid items={trendingData.slice(0, 12)} />
        </section>

        {/* Последние серии */}
        {recentData.length > 0 && (
          <section>
            <SectionHeader title="Новые серии" subtitle="Только что вышли" />
            <AnimeGrid items={recentData} showEpisode />
          </section>
        )}
      </div>
    </main>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}