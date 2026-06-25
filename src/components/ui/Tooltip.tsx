'use client';

import React, { useState } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  wrapperClassName?: string;
  delay?: number;
}

export function Tooltip({ content, children, position = 'top', className, wrapperClassName, delay = 0 }: TooltipProps) {
  const [open, setOpen] = useState(false);

  const variants = {
    top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 5 } },
    bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } },
    left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 5 } },
    right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -5 } },
  };

  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>
          <div className={cn("relative inline-flex cursor-default", wrapperClassName)}>
            {children}
          </div>
        </TooltipPrimitive.Trigger>
        
        <AnimatePresence>
          {open && (
            <TooltipPrimitive.Portal forceMount>
              <TooltipPrimitive.Content
                asChild
                side={position}
                sideOffset={8}
                collisionPadding={16}
                className="z-100"
              >
                <motion.div
                  initial={variants[position].initial}
                  animate={variants[position].animate}
                  exit={variants[position].exit}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 bg-card border border-secondary text-secondary text-[10px] font-mono font-bold uppercase tracking-widest pointer-events-none shadow-[0_0_15px_rgba(34,197,94,0.15)]",
                    className
                  )}
                  style={{
                    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
                  }}
                >
                  {content}
                </motion.div>
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          )}
        </AnimatePresence>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
