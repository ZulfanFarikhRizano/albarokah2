'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputRupiah } from '@/components/input-rupiah';
import { addKasAction } from '@/lib/actions';
import { hariIniWIB } from '@/lib/utils';
import { CheckCircle2, Loader2, Check, ChevronDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const KATEGORI_OPTIONS = [
  { value: 'Pemasukan', label: 'Pemasukan (Tunai/Transfer)', dot: 'bg-emerald-500' },
  { value: 'Pengeluaran', label: 'Pengeluaran (Tunai/Transfer)', dot: 'bg-rose-500' },
  { value: 'Pemasukan QRIS', label: 'Pemasukan QRIS', dot: 'bg-sky-500' },
  { value: 'Pengeluaran QRIS', label: 'Pengeluaran QRIS', dot: 'bg-indigo-500' },
];

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function FormTambahKas() {
  const [isPending, startTransition] = useTransition();
  const [notif, setNotif] = useState<string | null>(null);
  
  // State Form
  const [nominal, setNominal] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Pemasukan');
  const [selectedDate, setSelectedDate] = useState(hariIniWIB()); // Format YYYY-MM-DD
  
  // State UI
  const [isKategoriOpen, setIsKategoriOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate)); // Untuk navigasi kalender
  
  const kategoriRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Menutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kategoriRef.current && !kategoriRef.current.contains(event.target as Node)) setIsKategoriOpen(false);
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setIsDateOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler Submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('kategori', selectedKategori);
    formData.set('tanggal', selectedDate);

    startTransition(async () => {
      const res = (await addKasAction(formData)) as { error?: string } | undefined;

      if (res?.error) {
        alert('Gagal menyimpan: ' + res.error);
      } else {
        setNotif('Transaksi berhasil disimpan!');
        setNominal('');
        setSelectedKategori('Pemasukan');
        setSelectedDate(hariIniWIB());
        setViewDate(new Date(hariIniWIB()));
        formRef.current?.reset();
        setTimeout(() => setNotif(null), 3500);
      }
    });
  };

  // --- LOGIKA CUSTOM KALENDER ---
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    // Format ke YYYY-MM-DD (WIB/Lokal aman)
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setIsDateOpen(false);
  };

  // Format tanggal untuk ditampilkan di tombol (Misal: 13 Nov 2026)
  const displayDate = () => {
    const d = new Date(selectedDate);
    return `${d.getDate()} ${NAMA_BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
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
        
        {/* 1. CUSTOM DATE PICKER */}
        <div className="relative" ref={dateRef}>
          <input type="hidden" name="tanggal" value={selectedDate} />
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <CalendarIcon size={16} className="text-slate-500 shrink-0" />
              <span className="font-medium">{displayDate()}</span>
            </div>
            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 shrink-0 ml-1 ${isDateOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDateOpen && (
            <div className="absolute left-0 top-11 z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900">
              {/* Kalender Header */}
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {NAMA_BULAN[currentMonth]} {currentYear}
                </div>
                <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
              
              {/* Kalender Grid Hari */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {NAMA_HARI.map(hari => (
                  <div key={hari} className="text-center text-[11px] font-bold text-slate-400 uppercase">{hari}</div>
                ))}
              </div>

              {/* Kalender Grid Tanggal */}
              <div className="grid grid-cols-7 gap-1">
                {/* Kotak kosong awal bulan */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 w-8" />
                ))}
                {/* Kotak tanggal */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const currentDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === currentDateStr;
                  const isToday = hariIniWIB() === currentDateStr;
                  
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      className={`h-8 w-8 rounded-md flex items-center justify-center text-sm transition-all
                        ${isSelected ? 'bg-primary-600 text-white font-bold shadow-sm' : 
                          isToday ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200 dark:bg-primary-900/30 dark:border-primary-800' : 
                          'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. INPUT KETERANGAN */}
        <Input
          name="keterangan"
          placeholder="Keterangan transaksi..."
          required
          maxLength={200}
          aria-label="Keterangan"
          className="lg:col-span-2 shadow-sm"
        />

        {/* 3. CUSTOM KATEGORI DROPDOWN */}
        <div className="relative" ref={kategoriRef}>
          <input type="hidden" name="kategori" value={selectedKategori} />
          
          <button
            type="button"
            onClick={() => setIsKategoriOpen(!isKategoriOpen)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${currentOption.dot}`} />
              <span className="truncate font-medium text-slate-800 dark:text-slate-200">{currentOption.label}</span>
            </div>
            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 shrink-0 ml-1 ${isKategoriOpen ? 'rotate-180' : ''}`} />
          </button>

          {isKategoriOpen && (
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
                        setIsKategoriOpen(false);
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

        {/* 4. INPUT NOMINAL */}
        <InputRupiah
          name="nominal"
          placeholder="Nominal (Rp)"
          required
          value={nominal}
          onChange={setNominal}
        />

        {/* 5. TOMBOL SUBMIT */}
        <Button
          type="submit"
          disabled={isPending}
          className="justify-self-start sm:col-span-2 lg:col-span-5 flex items-center gap-2 min-w-[160px] shadow-sm"
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