// src/lib/hooks/useSources.ts
'use client';

import { useState, useEffect } from 'react';

interface Source {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface SourcesData {
  sources: Source[];
  subtitles: any[];
  headers?: Record<string, string>;
}

const SERVERS = ['vidcloud', 'streamsb', 'vidstreaming', 'mega'];

export function useSources(episodeId: string | null) {
  const [data, setData] = useState<SourcesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentServer, setCurrentServer] = useState(SERVERS[0]);
  const [availableServers] = useState(SERVERS);

  useEffect(() => {
    if (!episodeId) return;
    fetchSources(episodeId, currentServer);
  }, [episodeId, currentServer]);

  const fetchSources = async (id: string, server: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Используем наш Next.js API роут как прокси
      const res = await fetch(
        `/api/anime/sources?episodeId=${encodeURIComponent(id)}&server=${server}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError('Не удалось загрузить источник');
      
      // Пробуем следующий сервер автоматически
      const nextIndex = SERVERS.indexOf(server) + 1;
      if (nextIndex < SERVERS.length) {
        setTimeout(() => setCurrentServer(SERVERS[nextIndex]), 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchServer = (server: string) => {
    setCurrentServer(server);
  };

  return {
    sources: data?.sources || [],
    subtitles: data?.subtitles || [],
    headers: data?.headers,
    isLoading,
    error,
    currentServer,
    availableServers,
    switchServer,
  };
}