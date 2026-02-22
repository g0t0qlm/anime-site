// src/types/index.ts

export interface Anime {
  id: string;
  malId?: number;
  anilistId?: number;
  title: {
    ru?: string;
    english?: string;
    romaji: string;
    native?: string;
  };
  description?: string;
  coverImage: string;
  bannerImage?: string;
  totalEpisodes?: number;
  currentEpisode?: number;
  status: 'Ongoing' | 'Completed' | 'Not yet aired' | 'Cancelled';
  genres: string[];
  year?: number;
  season?: string;
  rating?: number;
  studios?: string[];
  type?: string;
}

export interface Episode {
  id: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
  airDate?: string;
  duration?: number;
}

export interface VideoSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface SubtitleTrack {
  url: string;
  lang: string;
  label: string;
}

export interface DubSource {
  id: string;
  label: string;
  language: string;
  sources: VideoSource[];
  subtitles?: SubtitleTrack[];
}

export interface SkipTime {
  interval: {
    startTime: number;
    endTime: number;
  };
  skipType: 'op' | 'ed' | 'recap' | 'mixed-ed' | 'mixed-op';
}

export interface PlayerSettings {
  autoSkipIntro: boolean;
  autoSkipOutro: boolean;
  autoPlay: boolean;
  autoNext: boolean;
  defaultQuality: string;
  volume: number;
}