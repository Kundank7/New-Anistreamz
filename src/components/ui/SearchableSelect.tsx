'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Close } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({ value, onChange, options, placeholder = "Select...", className }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = search
    ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;

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
        <span className="truncate mr-4">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border-2 border-secondary/20 shadow-xl">
          {/* Search Input */}
          <div className="relative border-b border-secondary/10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search studio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-foreground pl-10 pr-4 py-3 text-sm font-bold tracking-wider outline-none placeholder:text-muted-text/50"
            />
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              <ul className="flex flex-col py-1">
                {filteredOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        if (option.value === value) {
                          onChange('');
                        } else {
                          onChange(option.value);
                        }
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all",
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
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-text">No studios match</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
