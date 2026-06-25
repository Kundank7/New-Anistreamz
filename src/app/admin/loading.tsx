import React from 'react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] space-y-6">
      <div className="relative w-16 h-16">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 border-4 border-t-secondary border-r-secondary/30 border-b-secondary/10 border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]" />
        {/* Inner reverse spinning ring */}
        <div className="absolute inset-2 border-4 border-b-secondary border-l-secondary/30 border-t-secondary/10 border-r-transparent rounded-full animate-[spin_2s_linear_infinite_reverse]" />
        {/* Center dot */}
        <div className="absolute inset-0 m-auto w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
      </div>
      <div className="flex flex-col items-center">
        <div className="text-secondary font-mono font-black tracking-[0.3em] uppercase text-sm animate-pulse mb-1">
          ACCESSING SYSTEM
        </div>
        <div className="text-muted-text font-mono text-[10px] tracking-widest uppercase">
          Establishing Secure Connection...
        </div>
      </div>
    </div>
  );
}
