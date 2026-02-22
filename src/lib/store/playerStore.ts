// src/lib/store/playerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerSettings, DubSource } from '@/types';

interface PlayerStore {
  // Настройки (сохраняются)
  settings: PlayerSettings;
  updateSettings: (settings: Partial<PlayerSettings>) => void;
  
  // Текущее состояние плеера
  currentQuality: string;
  currentDub: string;
  volume: number;
  isMuted: boolean;
  
  setCurrentQuality: (q: string) => void;
  setCurrentDub: (dub: string) => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  
  // История просмотров
  watchHistory: Record<string, { episode: number; progress: number; timestamp: number }>;
  updateWatchProgress: (animeId: string, episode: number, progress: number) => void;
  getWatchProgress: (animeId: string) => { episode: number; progress: number } | null;
  
  // Закладки
  bookmarks: string[];
  toggleBookmark: (animeId: string) => void;
  isBookmarked: (animeId: string) => boolean;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      settings: {
        autoSkipIntro: true,
        autoSkipOutro: false,
        autoPlay: true,
        autoNext: true,
        defaultQuality: '1080p',
        volume: 1,
      },
      
      updateSettings: (newSettings) =>
        set(state => ({ settings: { ...state.settings, ...newSettings } })),
      
      currentQuality: '1080p',
      currentDub: 'sub',
      volume: 1,
      isMuted: false,
      
      setCurrentQuality: (q) => set({ currentQuality: q }),
      setCurrentDub: (dub) => set({ currentDub: dub }),
      setVolume: (v) => set({ volume: v }),
      setMuted: (m) => set({ isMuted: m }),
      
      watchHistory: {},
      
      updateWatchProgress: (animeId, episode, progress) =>
        set(state => ({
          watchHistory: {
            ...state.watchHistory,
            [animeId]: { episode, progress, timestamp: Date.now() }
          }
        })),
      
      getWatchProgress: (animeId) => {
        const history = get().watchHistory[animeId];
        return history ? { episode: history.episode, progress: history.progress } : null;
      },
      
      bookmarks: [],
      
      toggleBookmark: (animeId) =>
        set(state => ({
          bookmarks: state.bookmarks.includes(animeId)
            ? state.bookmarks.filter(id => id !== animeId)
            : [...state.bookmarks, animeId]
        })),
      
      isBookmarked: (animeId) => get().bookmarks.includes(animeId),
    }),
    {
      name: 'anime-player-storage',
      partialize: (state) => ({
        settings: state.settings,
        watchHistory: state.watchHistory,
        bookmarks: state.bookmarks,
        volume: state.volume,
      }),
    }
  )
);