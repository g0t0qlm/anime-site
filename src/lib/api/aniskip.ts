// src/lib/api/aniskip.ts
import { SkipTime } from '@/types';

export async function getSkipTimes(
  malId: number,
  episode: number
): Promise<SkipTime[]> {
  try {
    const url = `https://api.aniskip.com/v2/skip-times/${malId}/${episode}?types[]=op&types[]=ed&types[]=recap`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.found) return [];
    
    return data.results as SkipTime[];
  } catch {
    return [];
  }
}

// Хелпер для получения конкретного типа
export function getIntroInterval(skipTimes: SkipTime[]) {
  return skipTimes.find(st => st.skipType === 'op' || st.skipType === 'mixed-op');
}

export function getOutroInterval(skipTimes: SkipTime[]) {
  return skipTimes.find(st => st.skipType === 'ed' || st.skipType === 'mixed-ed');
}