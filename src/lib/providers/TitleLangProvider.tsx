'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type TitleLang = 'jp' | 'en';

interface TitleLangContextType {
  titleLang: TitleLang;
  setTitleLang: (lang: TitleLang) => void;
}

const TitleLangContext = createContext<TitleLangContextType>({
  titleLang: 'jp',
  setTitleLang: () => {},
});

export function TitleLangProvider({ children }: { children: React.ReactNode }) {
  const [titleLang, setTitleLang] = useState<TitleLang>('jp');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('titleLang');
    if (stored === 'en' || stored === 'jp') {
      setTitleLang(stored);
    } else {
      // If not in localStorage, check cookie (fallback)
      const cookieMatch = document.cookie.match(/(?:^|; )titleLang=([^;]*)/);
      if (cookieMatch && (cookieMatch[1] === 'en' || cookieMatch[1] === 'jp')) {
        setTitleLang(cookieMatch[1]);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titleLang', titleLang);
      document.cookie = `titleLang=${titleLang}; path=/; max-age=31536000`; // 1 year
    }
  }, [titleLang, mounted]);

  return (
    <TitleLangContext.Provider value={{ titleLang, setTitleLang }}>
      {children}
    </TitleLangContext.Provider>
  );
}

export function useTitleLang() {
  return useContext(TitleLangContext);
}
