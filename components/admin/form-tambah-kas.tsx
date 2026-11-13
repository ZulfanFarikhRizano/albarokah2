'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputRupiah } from '@/components/input-rupiah';
import { addKasAction } from '@/lib/actions';
import { hariIniWIB } from '@/lib/utils';
import { CheckCircle2, Loader2, Check, ChevronDown } from 'lucide-react';

const KATEGORI_OPTIONS = [
  { value: 'Pemasukan', label: 'Pemasukan (Tunai/Transfer)', dot: 'bg-emerald-500' },
  { value: 'Pengeluaran', label: 'Pengeluaran (Tunai/Transfer)', dot: 'bg-rose-500' },
  { value: 'Pemasukan QRIS', label: 'Pemasukan QRIS', dot: 'bg-sky-500' },
  { value: 'Pengeluaran QRIS', label: 'Pengeluaran QRIS', dot: 'bg-indigo-500' },
];

export function FormTambahKas() {
  const [isPending, startTransition] = useTransition();
  const [notif, setNotif] = useState<string | null>(null);
  const [nominal, setNominal] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Pemasukan');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('kategori', selectedKategori);

    startTransition(async () => {
      const res = (await addKasAction(formData)) as { error?: string } | undefined;

      if (res?.error) {
        alert('Gagal menyimpan: ' + res.error);
      } else {
        setNotif('Transaksi berhasil disimpan!');
        setNominal('');
        setSelectedKategori('Pemasukan');
        formRef.current?.reset();
        setTimeout(() => setNotif(null), 3500);
      }
    });
  };

  const currentOption = KATEGORI_OPTIONS.find((o) => o.value === selectedKategori) || KATEGORI_OPTIONS[0];

  return (
    <div className="space-y-3">
      {/* Banner Notifikasi Berhasil */}
      {notif && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 transition-all animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
          <span>{notif}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          type="date"
          name="tanggal"
          required
          defaultValue={hariIniWIB()}
          aria-label="Tanggal"
        />

        <Input
          name="keterangan"
          placeholder="Keterangan transaksi..."
          required
          maxLength={200}
          aria-label="Keterangan"
          className="lg:col-span-2"
        />

        {/* Custom Professional Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <input type="hidden" name="kategori" value={selectedKategori} />
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all shadow-sm"
            aria-expanded={isOpen}
            aria-label="Pilih Kategori Transaksi"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${currentOption.dot}`} />
              <span className="truncate font-medium text-slate-800 dark:text-slate-200">{currentOption.label}</span>
            </div>
            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-1">
                {KATEGORI_OPTIONS.map((opt) => {
                  const isSelected = opt.value === selectedKategori;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedKategori(opt.value);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected 
                          ? 'bg-emerald-50 text-emerald-900 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-3 w-3 shrink-0 rounded-full ${opt.dot} ring-2 ring-white dark:ring-slate-900`} />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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