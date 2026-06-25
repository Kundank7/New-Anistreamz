'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface MobileNavSelectProps {
  options: { value: string; label: string }[];
  currentValue: string;
  baseUrl: string;
  paramName: string;
}

export function MobileNavSelect({ options, currentValue, baseUrl, paramName }: MobileNavSelectProps) {
  const router = useRouter();

  const handleChange = (val: string) => {
    router.push(`${baseUrl}?${paramName}=${encodeURIComponent(val)}`);
  };

  return (
    <div className="w-48 md:hidden">
      <CustomSelect 
        value={currentValue}
        onChange={handleChange}
        options={options}
      />
    </div>
  );
}
