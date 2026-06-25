'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  formatDisplay?: (selected: Option[]) => string;
}

export function MultiSelect({ values, onChange, options, placeholder = "Select...", className, formatDisplay }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const selectedOptions = options.filter(o => values.includes(o.value));
  const displayText = selectedOptions.length > 0 && formatDisplay
    ? formatDisplay(selectedOptions)
    : selectedOptions.length > 0
      ? `${values.length} selected`
      : placeholder;

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2 bg-background border-2 transition-all font-bold uppercase tracking-wider text-sm",
          isOpen
            ? "border-secondary text-secondary shadow-[0_0_10px_rgba(34,197,94,0.2)]"
            : "border-secondary/20 text-foreground hover:border-secondary/50"
        )}
      >
        <span className="truncate mr-4">{displayText}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border-2 border-secondary/20 shadow-xl max-h-72 overflow-y-auto custom-scrollbar">
          <ul className="flex flex-col py-1">
            {options.map((option) => {
              const isSelected = values.includes(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3",
                      isSelected
                        ? "bg-secondary/10 text-secondary border-l-2 border-secondary"
                        : "text-muted-text hover:bg-secondary/5 hover:text-foreground border-l-2 border-transparent"
                    )}
                  >
                    <span className={cn(
                      "w-4 h-4 border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "bg-secondary border-secondary" : "border-muted-text/40"
                    )}>
                      {isSelected && <span className="text-background text-[8px] font-black leading-none">✓</span>}
                    </span>
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
