// src/lib/utils.ts

// Форматирование времени видео
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Слияние классов
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Дебаунс
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Форматирование описания (убирает HTML теги)
export function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim() || '';
}

// Текущий сезон
export function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month < 3) return 'WINTER';
  if (month < 6) return 'SPRING';
  if (month < 9) return 'SUMMER';
  return 'FALL';
}