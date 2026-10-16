'use client';

import { useState, useTransition, useRef } from 'react';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputRupiah } from '@/components/input-rupiah';
import { addKasAction } from '@/lib/actions';
import { hariIniWIB } from '@/lib/data';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function FormTambahKas() {
  const [isPending, startTransition] = useTransition();
  const [notif, setNotif] = useState<string | null>(null);
  const [nominal, setNominal] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      // Tambahkan type assertion di sini
      const res = (await addKasAction(formData)) as { error?: string } | undefined;

      if (res?.error) {
        alert('Gagal menyimpan: ' + res.error);
      } else {
        setNotif('Transaksi berhasil disimpan!');
        setNominal('');
        formRef.current?.reset();
        setTimeout(() => setNotif(null), 3500);
      }
    });
  };

  return (
    <div className="space-y-3">
      {notif && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-all animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
          <span>{notif}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input type="date" name="tanggal" required defaultValue={hariIniWIB()} aria-label="Tanggal" />
        <Input name="keterangan" placeholder="Keterangan" required maxLength={200} aria-label="Keterangan" className="lg:col-span-2" />
        <Select name="kategori" aria-label="Kategori">
          <option value="Pemasukan">Pemasukan</option>
          <option value="Pengeluaran">Pengeluaran</option>
        </Select>

        <InputRupiah
          name="nominal"
          placeholder="Nominal (Rp)"
          required
          value={nominal}
          onChange={setNominal}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="justify-self-start sm:col-span-2 lg:col-span-5 flex items-center gap-2 min-w-[160px]"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            'Simpan Transaksi'
          )}
        </Button>
      </form>
    </div>
  );
}