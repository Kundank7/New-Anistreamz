'use client';

import * as React from 'react';
import { Checkmark } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex items-center gap-3 cursor-pointer group", props.disabled && "cursor-not-allowed opacity-50", className)}>
        <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
          <input
            type="checkbox"
            className="peer absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed"
            ref={ref}
            {...props}
          />
          {/* Custom Checkbox Box */}
          <div className="absolute inset-0 bg-background border border-border peer-checked:border-secondary peer-focus-visible:border-secondary transition-all group-hover:border-secondary/50 peer-checked:shadow-[0_0_8px_rgba(34,197,94,0.25)]" />
          {/* Check Icon */}
          <Checkmark className="w-3.5 h-3.5 text-secondary opacity-0 peer-checked:opacity-100 transition-opacity z-0" />
        </div>
        {label && (
          <span className="text-sm font-mono text-muted-text group-hover:text-foreground transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
