// src/lib/api/consumet.ts
import axios from 'axios';
import { Anime, Episode, VideoSource, SubtitleTrack } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CONSUMET_URL,
  timeout: 15000,
});

// ═══════════════════════════════════
// ПОИСК
// ═══════════════════════════════════
export async function searchAnime(query: string, page = 1) {
  try {
    // Пробуем разные провайдеры
    const [zoro, gogo] = await Promise.allSettled([
      api.get(`/anime/zoro/${encodeURIComponent(query)}?page=${page}`),
      api.get(`/anime/gogoanime/${encodeURIComponent(query)}?page=${page}`),
    ]);

    const zoroData = zoro.status === 'fulfilled' ? zoro.value.data.results : [];
    const gogoData = gogo.status === 'fulfilled' ? gogo.value.data.results : [];

    // Мёрджим без дубликатов по названию
    const seen = new Set<string>();
    const merged = [...zoroData, ...gogoData].filter(item => {
      const key = item.title?.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return merged;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// ═══════════════════════════════════
// ИНФОРМАЦИЯ ОБ АНИМЕ
// ═══════════════════════════════════
export async function getAnimeInfo(id: string, provider: 'zoro' | 'gogoanime' = 'zoro') {
  const { data } = await api.get(`/anime/${provider}/info?id=${id}`);
  return data;
}

// ═══════════════════════════════════
// ИСТОЧНИКИ ДЛЯ ПРОСМОТРА
// ═══════════════════════════════════
export async function getEpisodeSources(
  episodeId: string,
  provider: 'zoro' | 'gogoanime' = 'zoro',
  server?: string
) {
  try {
    let url = `/anime/${provider}/watch?episodeId=${encodeURIComponent(episodeId)}`;
    if (server) url += `&server=${server}`;

    const { data } = await api.get(url);
    return data as {
      sources: VideoSource[];
      subtitles?: SubtitleTrack[];
      headers?: Record<string, string>;
    };
  } catch (error) {
    // Фоллбэк на другой провайдер
    console.error('Source error, trying fallback:', error);
    if (provider === 'zoro') {
      return getEpisodeSources(episodeId, 'gogoanime');
    }
    throw error;
  }
}

// ═══════════════════════════════════
// ПОСЛЕДНИЕ РЕЛИЗЫ
// ═══════════════════════════════════
export async function getRecentEpisodes(page = 1) {
  const { data } = await api.get(`/anime/gogoanime/recent-episodes?page=${page}&type=1`);
  return data;
}

// ═══════════════════════════════════
// ПОПУЛЯРНОЕ
// ═══════════════════════════════════
export async function getTrending(page = 1) {
  const { data } = await api.get(`/anime/gogoanime/top-airing?page=${page}`);
  return data;
}

// ═══════════════════════════════════
// СЕРВЕРЫ ДЛЯ ЭПИЗОДА (разные CDN)
// ═══════════════════════════════════
export async function getEpisodeServers(episodeId: string, provider = 'zoro') {
  const { data } = await api.get(
    `/anime/${provider}/servers?episodeId=${encodeURIComponent(episodeId)}`
  );
  return data; // Список серверов: VidCloud, StreamSB, etc.
}