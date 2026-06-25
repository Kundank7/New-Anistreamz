'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll position on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
