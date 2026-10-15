'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function SubmitButton({ label = "Simpan Perubahan" }: { label?: string }) {
  // useFormStatus akan mendeteksi apakah form sedang dalam proses pengiriman (loading)
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="justify-self-start">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Menyimpan..." : label}
    </Button>
  );
}