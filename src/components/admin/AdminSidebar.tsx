'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Dashboard, 
  DataBase, 
  Terminal, 
  Locked,
  Power,
  ChevronLeft,
  ChevronRight,
  Home,
  Moon,
  Sun
} from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Tooltip } from '@/components/ui/Tooltip';

export function AdminSidebar({ initialCollapsed = false }: { initialCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    const newVal = !collapsed;
    setCollapsed(newVal);
    document.cookie = `sidebar_collapsed=${newVal}; path=/; max-age=31536000`;
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: Dashboard },
    { name: 'Data Nexus', path: '/admin/database', icon: DataBase },
    { name: 'Operations', path: '/admin/operations', icon: Terminal },
    { name: 'Protected Center', path: '/admin/protected', icon: Locked },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 relative",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Header */}
      <div className="h-20 flex items-center border-b border-secondary/20 shrink-0 overflow-x-hidden">
        <div className="w-[80px] shrink-0 flex justify-center items-center">
          <img src="/icon.png" alt="Anistreamz" className="w-8 h-8 bg-black object-contain shrink-0" />
        </div>
        <span className={cn(
          "font-black tracking-tighter text-secondary uppercase whitespace-nowrap transition-all duration-300 overflow-hidden",
          collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
        )}>
          Operator Panel
        </span>
      </div>

      {/* Collapse Toggle */}
      <div className="absolute -right-3 top-4 z-50 flex items-center justify-center filter drop-shadow-md dark:drop-shadow-[0_0_4px_rgba(34,197,94,0.3)]">
        <button 
          onClick={toggleSidebar}
          className="w-6 h-12 bg-card group relative overflow-hidden flex items-center justify-center"
          style={{ 
            clipPath: collapsed 
              ? 'polygon(0 0, 100% 4px, 100% calc(100% - 4px), 0 100%)' 
              : 'polygon(0 4px, 100% 0, 100% 100%, 0 calc(100% - 4px))'
          }}
        >
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/20 transition-colors z-0" />
          <div className="relative z-10">
            {collapsed ? <ChevronRight className="w-4 h-4 text-secondary" /> : <ChevronLeft className="w-4 h-4 text-secondary" />}
          </div>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-8 flex flex-col gap-2 overflow-x-hidden overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          
          const linkContent = (
            <Link 
              href={item.path}
              className={cn(
                "group flex items-center py-3 text-sm font-bold tracking-widest uppercase transition-colors relative w-full",
                isActive 
                  ? "text-secondary bg-secondary/10" 
                  : "text-muted-text hover:text-foreground hover:bg-foreground/5"
              )}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
              )}
              
              <div className="w-[80px] shrink-0 flex justify-center items-center">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-secondary" : "group-hover:text-foreground"
                )} />
              </div>
              
              <span className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
              )}>
                {item.name}
              </span>
            </Link>
          );

          return collapsed ? (
            <Tooltip key={item.path} content={item.name} position="right" wrapperClassName="w-full flex">
              {linkContent}
            </Tooltip>
          ) : (
            <React.Fragment key={item.path}>
              {linkContent}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-secondary/20 shrink-0 flex flex-col py-4 overflow-x-hidden">
        {(() => {
          const homeContent = (
            <Link
              href="/"
              className="w-full flex items-center py-3 text-muted-text hover:text-foreground hover:bg-foreground/5 font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer group"
            >
              <div className="w-[80px] shrink-0 flex justify-center items-center">
                <Home className="w-5 h-5 group-hover:text-foreground transition-colors" />
              </div>
              <span className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
              )}>
                Public Grid
              </span>
            </Link>
          );
          return collapsed ? (
            <Tooltip content="Public Grid" position="right" wrapperClassName="w-full flex">
              {homeContent}
            </Tooltip>
          ) : homeContent;
        })()}

        {mounted && (() => {
          const themeContent = (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center py-3 text-muted-text hover:text-secondary hover:bg-secondary/10 font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer group"
            >
              <div className="w-[80px] shrink-0 flex justify-center items-center">
                {theme === 'dark' ? <Sun className="w-5 h-5 group-hover:text-secondary transition-colors" /> : <Moon className="w-5 h-5 group-hover:text-secondary transition-colors" />}
              </div>
              <span className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
              )}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          );
          return collapsed ? (
            <Tooltip content="Toggle Theme" position="right" wrapperClassName="w-full flex">
              {themeContent}
            </Tooltip>
          ) : themeContent;
        })()}

        {(() => {
          const logoutContent = (
            <button
              onClick={handleLogout}
              className="w-full flex items-center py-3 text-danger hover:text-danger/80 hover:bg-danger/10 font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer group"
            >
              <div className="w-[80px] shrink-0 flex justify-center items-center">
                <Power className="w-5 h-5 group-hover:text-danger/80 transition-colors" />
              </div>
              <span className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
              )}>
                Terminate
              </span>
            </button>
          );
          return collapsed ? (
            <Tooltip content="Terminate Session" position="right" wrapperClassName="w-full flex">
              {logoutContent}
            </Tooltip>
          ) : logoutContent;
        })()}
      </div>
    </aside>
  );
}
