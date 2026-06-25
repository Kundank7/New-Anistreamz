'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Close } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: 'default' | 'large' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, className, size = 'default' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "relative w-full max-h-[90vh] bg-card/90 backdrop-blur-sm border border-secondary/50 pointer-events-auto flex flex-col shadow-[0_0_30px_rgba(34,197,94,0.15)]",
                size === 'xl' ? 'max-w-5xl' : size === 'large' ? 'max-w-3xl' : 'max-w-lg',
                className
              )}
              style={{
                clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-10">
                {title ? (
                  typeof title === 'string' ? (
                    <h2 className="text-lg font-black tracking-widest text-secondary uppercase font-mono">
                      {title}
                    </h2>
                  ) : (
                    title
                  )
                ) : (
                  <div />
                )}
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-foreground/10 transition-colors text-muted-text hover:text-foreground cursor-pointer"
                  style={{
                    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                  }}
                >
                  <Close className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className={cn("relative flex-1 min-h-0 flex flex-col", !footer && "mb-6")}>
                {/* Decorative L-Shapes (HUD Reticle Style) */}
                <div className="absolute top-0 left-4 w-4 h-4 border-t-2 border-l-2 border-secondary/50 pointer-events-none z-10" />
                <div className="absolute bottom-0 right-4 w-4 h-4 border-b-2 border-r-2 border-secondary/50 pointer-events-none z-10" />
                
                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  {children}
                </div>
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-6 pt-10 flex justify-end gap-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
