'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function InputRupiah({ name, placeholder, required }: { name: string, placeholder?: string, required?: boolean }) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya ambil angka dari ketikan user
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (!rawValue) {
      setValue("");
      return;
    }
    // Format menjadi gaya Indonesia (pemisah titik)
    const formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue));
    setValue(formatted);
  };

  return (
    <div className="relative">
      {/* Input visual yang dilihat dan diketik user */}
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        aria-label={placeholder}
      />
      {/* Input rahasia yang akan dikirim ke action database */}
      <input 
        type="hidden" 
        name={name} 
        value={value.replace(/\./g, '')} 
      />
    </div>
  );
}