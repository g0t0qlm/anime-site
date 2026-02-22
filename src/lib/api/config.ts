// src/lib/api/config.ts

// Публичные Consumet инстансы (работают прямо сейчас)
export const CONSUMET_INSTANCES = [
  'https://consumet-api.vercel.app',
  'https://api.consumet.org',
  'https://consumet.azurewebsites.net',
];

// Прямые API без парсера
export const DIRECT_APIS = {
  // Aniwatch (Zoro) — официальное API
  aniwatch: 'https://api.aniwatch.to',
  
  // AniList — метаданные
  anilist: 'https://graphql.anilist.co',
  
  // Jikan (MAL) — метаданные  
  jikan: 'https://api.jikan.moe/v4',
  
  // AniSkip — тайминги опенингов
  aniskip: 'https://api.aniskip.com/v2',
  
  // Kitsu — ещё один источник метаданных
  kitsu: 'https://kitsu.io/api/edge',
};