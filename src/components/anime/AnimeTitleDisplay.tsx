'use client';

import { useTitleLang } from '@/lib/providers/TitleLangProvider';

export function AnimeTitleDisplay({ title, titleEnglish }: { title: string; titleEnglish?: string }) {
  const { titleLang } = useTitleLang();
  const display = titleLang === 'en' && titleEnglish ? titleEnglish : title;
  return <>{display}</>;
}
