'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Renew } from '@carbon/icons-react';
import { toast } from 'sonner';
import { Tooltip } from '@/components/ui/Tooltip';

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      toast.success('Dashboard metrics refreshed');
    });
  };

  return (
    <Tooltip content="Reload Dashboard" position="bottom">
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="relative p-2 border border-secondary/30 hover:border-secondary text-secondary transition-all cursor-pointer flex items-center justify-center group disabled:opacity-50"
        aria-label="Refresh Dashboard"
      >
        <div className={`transition-transform duration-300 group-hover:scale-110 ${isPending ? 'animate-spin' : ''}`}>
          <Renew className="w-5 h-5" />
        </div>
      </button>
    </Tooltip>
  );
}
