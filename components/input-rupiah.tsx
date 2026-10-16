'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

export function InputRupiah({
  name,
  placeholder,
  required,
  value: externalValue,
  onChange: externalOnChange,
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (val: string) => void;
}) {
  const [value, setValue] = useState(externalValue || '');

  useEffect(() => {
    if (externalValue !== undefined) setValue(externalValue);
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setValue('');
      if (externalOnChange) externalOnChange('');
      return;
    }
    const formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue));
    setValue(formatted);
    if (externalOnChange) externalOnChange(formatted);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        aria-label={placeholder}
      />
      <input type="hidden" name={name} value={value.replace(/\./g, '')} />
    </div>
  );
}