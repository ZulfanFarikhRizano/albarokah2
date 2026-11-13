'use client';

import { useContext } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { FormPendingContext } from '@/components/admin/action-form';
import { cn } from '@/lib/utils';

/**
 * Tombol submit untuk semua form admin.
 * Otomatis disabled + spinner saat form sedang dikirim, baik form dibungkus
 * <ActionForm> maupun <form action={...}> biasa.
 */
export function SubmitButton({
  label = 'Simpan Perubahan',
  pendingLabel = 'Menyimpan…',
  variant = 'primary',
  className,
}: {
  label?: string;
  pendingLabel?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'accent';
  className?: string;
}) {
  const { pending: nativePending } = useFormStatus();
  const ctxPending = useContext(FormPendingContext);
  const pending = nativePending || ctxPending;

  return (
    <Button type="submit" variant={variant} loading={pending} className={cn('justify-self-start', className)}>
      {pending ? pendingLabel : label}
    </Button>
  );
}