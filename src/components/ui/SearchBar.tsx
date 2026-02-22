// src/components/ui/SearchBar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  onClose,
  autoFocus,
}: {
  onClose?: () => void;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <Search size={16} className="absolute left-3 text-slate-400" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Поиск аниме..."
        className="w-full pl-9 pr-9 py-2 rounded-lg text-sm text-white
                   placeholder-slate-500 focus:outline-none
                   border border-white/10 focus:border-violet-500/50"
        style={{ background: 'var(--bg-card)' }}
      />
      {(query || onClose) && (
        <button
          type="button"
          onClick={() => { setQuery(''); onClose?.(); }}
          className="absolute right-3 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}