// src/components/player/ServerSelector.tsx
'use client';

export default function ServerSelector({
  servers,
  current,
  onChange,
}: {
  servers: string[];
  current: string;
  onChange: (s: string) => void;
}) {
  if (!servers.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {servers.map(server => (
        <button
          key={server}
          onClick={() => onChange(server)}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all border
            ${current === server
              ? 'bg-violet-600/20 text-violet-400 border-violet-500/30'
              : 'text-slate-400 hover:text-white border-transparent'
            }`}
          style={{ background: current === server ? undefined : 'var(--bg-hover)' }}
        >
          {server}
        </button>
      ))}
    </div>
  );
}