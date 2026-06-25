'use client';

import { usePathname } from 'next/navigation';
import { TitleLangProvider } from "@/lib/providers/TitleLangProvider";
import { ViewModeProvider } from "@/lib/providers/ViewModeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSystemRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  return (
    <TitleLangProvider>
      <ViewModeProvider>
        {/* Global Scanline Effect (Replaces per-card scanlines, hidden in light mode) */}
        <div className="hidden dark:block fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.08)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,100%_100%] z-[100]" />
        
        {isSystemRoute ? (
          <main className="grow">{children}</main>
        ) : (
          <div className="flex flex-col min-h-screen relative">
            <ScrollToTop />
            <Navbar />
            <MobileBottomNav />
            <main className="grow pt-20 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
          </div>
        )}
      </ViewModeProvider>
    </TitleLangProvider>
  );
}
