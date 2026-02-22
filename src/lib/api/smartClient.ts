// src/lib/api/smartClient.ts

const INSTANCES = [
  'https://consumet-api.vercel.app',
  'https://api.consumet.org',
  'https://consumet.azurewebsites.net',
];

// Запоминаем какой инстанс работает быстрее
let bestInstance: string | null = null;

async function pingInstance(url: string): Promise<number> {
  const start = Date.now();
  try {
    await fetch(`${url}/anime/gogoanime/one%20piece?page=1`, {
      signal: AbortSignal.timeout(5000),
    });
    return Date.now() - start;
  } catch {
    return Infinity;
  }
}

export async function getBestInstance(): Promise<string> {
  if (bestInstance) return bestInstance;

  // Пингуем все инстансы параллельно
  const results = await Promise.all(
    INSTANCES.map(async (url) => ({
      url,
      ping: await pingInstance(url),
    }))
  );

  // Берём самый быстрый рабочий
  const best = results
    .filter(r => r.ping !== Infinity)
    .sort((a, b) => a.ping - b.ping)[0];

  if (!best) throw new Error('Все серверы недоступны');
  
  bestInstance = best.url;
  
  // Сбрасываем кэш через 5 минут
  setTimeout(() => { bestInstance = null; }, 5 * 60 * 1000);
  
  return bestInstance;
}

// Умный fetch с автоматическим переключением инстансов
export async function consumetFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const errors: Error[] = [];

  // Пробуем каждый инстанс
  for (const instance of INSTANCES) {
    try {
      const res = await fetch(`${instance}${path}`, {
        ...options,
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 300 }, // Кэш 5 минут
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      return await res.json() as T;
    } catch (e) {
      errors.push(e as Error);
      continue; // Пробуем следующий
    }
  }

  throw new Error(`Все инстансы недоступны: ${errors.map(e => e.message).join(', ')}`);
}