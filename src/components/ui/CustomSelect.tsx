'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  formatDisplay?: (selected: Option) => string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Select...", className, formatDisplay }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
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
        <span className="truncate mr-4">{selectedOption ? (formatDisplay ? formatDisplay(selectedOption) : selectedOption.label) : placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border-2 border-secondary/20 shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          <ul className="flex flex-col py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all",
                    value === option.value
                      ? "bg-secondary/10 text-secondary border-l-2 border-secondary"
                      : "text-muted-text hover:bg-secondary/5 hover:text-foreground border-l-2 border-transparent"
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
