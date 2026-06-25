'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight, Renew } from '@carbon/icons-react';
import { useHistory } from '@/lib/hooks/useHistory';
import { cn } from '@/lib/utils';

interface SmartWatchButtonProps {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  className?: string;
  variant?: 'primary' | 'outline';
  label?: string;
  iconSize?: number;
}

export function SmartWatchButton({ 
  animeId, 
  animeTitle, 
  animeImage, 
  className,
  variant = 'primary',
  label = 'Watch Now',
  iconSize = 6
}: SmartWatchButtonProps) {
  const router = useRouter();
  const { history } = useHistory();
  const [loading, setLoading] = useState(false);

  const handleWatch = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  const savedProgress = history.find(h => h.animeId === animeId);

  if (savedProgress) {
    router.push(
      `/watch/${animeId}/sub/${savedProgress.lastEpisodeId}`
    );
    return;
  }

  router.push(`/watch/${animeId}/sub/1`);
};
  return (
    <button
      onClick={handleWatch}
      disabled={loading}
      className={cn(
        "flex items-center justify-center space-x-2 transition-all disabled:opacity-70 cursor-pointer",
        variant === 'primary' ? "btn-primary" : "px-6 py-3 rounded-lg border border-border font-medium hover:bg-foreground/5",
        className
      )}
    >
      {loading ? (
        <Renew style={{ width: iconSize * 4, height: iconSize * 4 }} className="animate-spin fill-current" />
      ) : (
        <CaretRight style={{ width: iconSize * 4, height: iconSize * 4 }} className="fill-current" />
      )}
      <span>{loading ? 'Finding Episode...' : label}</span>
    </button>
  );
}
