// src/lib/api/anime.ts
import { consumetFetch } from './smartClient';

// ═══════════════════════════════════
// ПОИСК
// ═══════════════════════════════════
export async function searchAnime(query: string, page = 1) {
  // Ищем через Zoro (лучше качество)
  const data = await consumetFetch<any>(
    `/anime/zoro/${encodeURIComponent(query)}?page=${page}`
  );
  return data.results || [];
}

// ═══════════════════════════════════
// ИНФОРМАЦИЯ ОБ АНИМЕ
// ═══════════════════════════════════
export async function getAnimeInfo(id: string) {
  return consumetFetch<any>(`/anime/zoro/info?id=${id}`);
}

// ═══════════════════════════════════
// ИСТОЧНИКИ ЭПИЗОДА
// ═══════════════════════════════════
export async function getEpisodeSources(episodeId: string, server = 'vidcloud') {
  return consumetFetch<any>(
    `/anime/zoro/watch?episodeId=${encodeURIComponent(episodeId)}&server=${server}`
  );
}

// ═══════════════════════════════════
// СЕРВЕРЫ ДЛЯ ЭПИЗОДА
// ═══════════════════════════════════
export async function getEpisodeServers(episodeId: string) {
  return consumetFetch<any>(
    `/anime/zoro/servers?episodeId=${encodeURIComponent(episodeId)}`
  );
}

// ═══════════════════════════════════
// ТРЕНДИНГ / ПОПУЛЯРНОЕ
// ═══════════════════════════════════
export async function getTrending(page = 1) {
  return consumetFetch<any>(`/anime/zoro/top-airing?page=${page}`);
}

export async function getRecentEpisodes(page = 1) {
  return consumetFetch<any>(`/anime/zoro/recent-episodes?page=${page}`);
}

// ═══════════════════════════════════
// РАСПИСАНИЕ
// ═══════════════════════════════════
export async function getSchedule() {
  return consumetFetch<any>(`/anime/zoro/schedule`);
}