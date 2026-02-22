// src/components/ui/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Bookmark, Settings, Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled ? 'glass border-b border-white/5 py-3' : 'py-5'}
        `}
      >
        <div className="max-w-screen-2xl mx-auto px-6 flex items-center gap-6">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-sm font-bold">
              鬼
            </div>
            <span className="text-lg font-bold gradient-text">AniStream</span>
          </Link>

          {/* Навигация */}
          <div className="hidden md:flex items-center gap-1 ml-4">
            {[
              { href: '/', label: 'Главная' },
              { href: '/catalog', label: 'Каталог' },
              { href: '/schedule', label: 'Расписание' },
              { href: '/top', label: 'Топ' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Правая часть */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Поиск */}
            {showSearch ? (
              <div className="w-72">
                <SearchBar onClose={() => setShowSearch(false)} autoFocus />
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Search size={18} />
              </button>
            )}

            <Link
              href="/bookmarks"
              className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Bookmark size={18} />
            </Link>

            <Link
              href="/settings"
              className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Отступ под navbar */}
      <div className="h-20" />
    </>
  );
}