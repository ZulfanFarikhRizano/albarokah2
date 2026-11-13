'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { HapusButton } from "@/components/admin/hapus-button";
import { useToast } from "@/components/admin/toast";
import { formatRupiah, hariIniWIB } from "@/lib/utils";
import { deleteKasAction } from "@/lib/actions";
import { FileText, Filter, Loader2 } from 'lucide-react';

type Kas = { id: string; tanggal: string; keterangan: string; kategori: string; nominal: number };

const fmtPanjang = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const tgl = (iso: string, f: Intl.DateTimeFormat) => f.format(new Date(`${iso}T00:00:00Z`));

const KasRow = memo(function KasRow({ k }: { k: Kas }) {
  const masuk = k.kategori.includes('Pemasukan');
  return (
    <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
      <td className="tabular whitespace-nowrap px-4 py-3 text-slate-600">{tgl(k.tanggal, fmtPanjang)}</td>
      <td className="px-4 py-3 font-medium text-slate-800">{k.keterangan}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
            k.kategori.includes('QRIS')
              ? 'bg-sky-100 text-sky-700'
              : masuk
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          }`}
        >
          {k.kategori}
        </span>
      </td>
      <td className={`tabular px-4 py-3 text-right font-bold ${masuk ? 'text-emerald-600' : 'text-rose-600'}`}>
        {masuk ? '+' : '-'}
        {formatRupiah(k.nominal)}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <HapusButton action={deleteKasAction.bind(null, k.id)} label={`Hapus transaksi ${k.keterangan}`} />
        </div>
      </td>
    </tr>
  );
});

export function KasTableClient({ initialData }: { initialData: Kas[] }) {
  const [filterType, setFilterType] = useState('Pekan Ini (7 Hari Terakhir)');
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();
  const logoRef = useRef<Promise<string | null> | null>(null);

  const kasTerfilter = useMemo(() => {
    if (filterType === 'Semua') return initialData;
    const hariIni = hariIniWIB();
    if (filterType === 'Bulan Ini') {
      const bulan = hariIni.slice(0, 7);
      return initialData.filter((k) => k.tanggal.slice(0, 7) === bulan);
    }
    if (filterType === 'Pekan Ini (7 Hari Terakhir)') {
      const d = new Date(`${hariIni}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 7);
      const batas = d.toISOString().slice(0, 10);
      return initialData.filter((k) => k.tanggal >= batas && k.tanggal <= hariIni);
    }
    return initialData;
  }, [filterType, initialData]);

  const loadLogo = () => {
    if (!logoRef.current) {
      logoRef.current = new Promise<string | null>((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          try {
            const c = document.createElement('canvas');
            c.width = 160;
            c.height = 160;
            c.getContext('2d')?.drawImage(img, 0, 0, 160, 160);
            resolve(c.toDataURL('image/png'));
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = '/images/logo.png';
      });
    }
    return logoRef.current;
  };

  const preparePdf = () => {
    void import('jspdf');
    void import('jspdf-autotable');
    void loadLogo();
  };
  
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(preparePdf);
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(preparePdf, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadPDF = async () => {
    if (isExporting) return;
    if (kasTerfilter.length === 0) {
      toast.error('Tidak ada data untuk diunduh pada rentang waktu ini.');
      return;
    }

    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 30));

    try {
      const [{ jsPDF }, autoTableMod, logo] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        loadLogo(),
      ]);
      const autoTable = autoTableMod.default;

      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });

      // Hitung Tanggal Mulai Periode
      const hariIni = hariIniWIB();
      let startDate = '0000-00-00';
      let namaPeriode = 'Pekan Ini';
      let judulLaporan = "LAPORAN KEUANGAN PEKANAN";
      
      if (filterType === 'Bulan Ini') {
        startDate = `${hariIni.slice(0, 7)}-01`;
        namaPeriode = 'Bulanan';
        judulLaporan = "LAPORAN KEUANGAN BULANAN";
      } else if (filterType === 'Pekan Ini (7 Hari Terakhir)') {
        const d = new Date(`${hariIni}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() - 7);
        startDate = d.toISOString().slice(0, 10);
        namaPeriode = 'Pekan Ini';
        judulLaporan = "LAPORAN KEUANGAN PEKANAN";
      } else {
        namaPeriode = 'Semua Waktu';
        judulLaporan = "LAPORAN KEUANGAN KESELURUHAN";
      }

      // Hitung Saldo Awal
      let saldoAwal = 0;
      if (filterType !== 'Semua') {
        const pastTransactions = initialData.filter(k => k.tanggal < startDate);
        pastTransactions.forEach(k => {
          if (k.kategori.includes('Pemasukan')) saldoAwal += k.nominal;
          else saldoAwal -= k.nominal;
        });
      }

      // Pemisahan Pemasukan dan Pengeluaran
      const pemasukanList = kasTerfilter.filter(k => k.kategori.includes('Pemasukan'));
      const pengeluaranList = kasTerfilter.filter(k => !k.kategori.includes('Pemasukan'));

      const totalPemasukanPeriode = pemasukanList.reduce((acc, curr) => acc + curr.nominal, 0);
      const totalPemasukanA = saldoAwal + totalPemasukanPeriode;
      
      const totalPengeluaranB = pengeluaranList.reduce((acc, curr) => acc + curr.nominal, 0);
      const saldoAkhir = totalPemasukanA - totalPengeluaranB;

      // 1. KOP SURAT MODERN
      // Garis aksen hijau atas
      doc.setFillColor(5, 150, 105); // Emerald-600
      doc.rect(0, 0, 210, 5, 'F');

      if (logo) {
        try {
          doc.addImage(logo, 'PNG', 14, 12, 18, 18, undefined, 'FAST');
        } catch { console.warn('Logo gagal dirender ke PDF'); }
      }

      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("MASJID JAMI' AL BAROKAH", 36, 17);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100); // slate-500
      doc.text("Perumahan Inkopad Blok D, Sasak Panjang, Tajur Halang, Kab. Bogor", 36, 22);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} | oleh Bendahara DKM`, 36, 27);
      
      // Garis pemisah kop surat
      doc.setLineWidth(0.8);
      doc.setDrawColor(5, 150, 105);
      doc.line(14, 33, 196, 33);

      // 2. JUDUL LAPORAN ELEGAN
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(judulLaporan, 105, 42, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`Filter Periode: ${filterType}`, 105, 47, { align: 'center' });

      // 3. TABEL A: PEMASUKAN
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("A. SALDO AWAL & PEMASUKAN", 14, 56);

      const bodyPemasukan = [
        ['1', 'Saldo Awal Periode', formatRupiah(saldoAwal)],
        ...pemasukanList.map((k, idx) => [String(idx + 2), k.keterangan, formatRupiah(k.nominal)])
      ];

      autoTable(doc, {
        startY: 59,
        head: [['No', 'Uraian / Keterangan', 'Jumlah (Rp)']],
        body: bodyPemasukan,
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
        columnStyles: { 
          0: { cellWidth: 12, halign: 'center' }, 
          1: { cellWidth: 'auto' }, 
          2: { cellWidth: 45, halign: 'right' } 
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        foot: [['', 'TOTAL PEMASUKAN', formatRupiah(totalPemasukanA)]],
        footStyles: { fillColor: [236, 253, 245], textColor: [5, 150, 105], fontStyle: 'bold' },
        willDrawCell: function (data: any) {
          if (data.section === 'foot' && data.column.index === 1) data.cell.styles.halign = 'right';
        }
      });

      // 4. TABEL B: PENGELUARAN
      let finalY = (doc as any).lastAutoTable.finalY || 70;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text("B. PENGELUARAN", 14, finalY + 10);

      autoTable(doc, {
        startY: finalY + 13,
        head: [['No', 'Uraian / Keterangan', 'Jumlah (Rp)']],
        body: pengeluaranList.length > 0 
          ? pengeluaranList.map((k, idx) => [String(idx + 1), k.keterangan, formatRupiah(k.nominal)])
          : [['-', 'Tidak ada pengeluaran pada periode ini', '-']],
        theme: 'grid',
        headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
        columnStyles: { 
          0: { cellWidth: 12, halign: 'center' }, 
          1: { cellWidth: 'auto' }, 
          2: { cellWidth: 45, halign: 'right' } 
        },
        alternateRowStyles: { fillColor: [255, 241, 242] },
        foot: [['', 'TOTAL PENGELUARAN', formatRupiah(totalPengeluaranB)]],
        footStyles: { fillColor: [255, 241, 242], textColor: [225, 29, 72], fontStyle: 'bold' },
        willDrawCell: function (data: any) {
          if (data.section === 'foot' && data.column.index === 1) data.cell.styles.halign = 'right';
        }
      });

      // 5. KOTAK SALDO AKHIR MODERN
      finalY = (doc as any).lastAutoTable.finalY || finalY + 20;
      
      doc.setDrawColor(5, 150, 105); // emerald-600
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.roundedRect(14, finalY + 8, 182, 14, 2, 2, 'FD'); 

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(4, 120, 87);
      doc.text("SALDO AKHIR Kas Masjid:", 20, finalY + 16.5);
      
      doc.setFontSize(13);
      doc.text(formatRupiah(saldoAkhir), 190, finalY + 16.5, { align: 'right' });

      // 6. TANDA TANGAN / PENGESAHAN
      const ttdY = finalY + 32;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text("Mengetahui,", 155, ttdY, { align: 'center' });
      doc.text("Bendahara DKM", 155, ttdY + 4, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text("( Pengurus / Bendahara )", 155, ttdY + 22, { align: 'center' });

      // SIMPAN PDF DENGAN NAMA BERSIH
      const namaFile = `Laporan Keuangan Al Barokah - ${namaPeriode}.pdf`;
      doc.save(namaFile);
      toast.success('Laporan PDF profesional berhasil dibuat.');

    } catch (error) {
      console.error('Gagal membuat PDF:', error);
      toast.error('Terjadi kesalahan saat membuat PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="mb-4 mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-lg font-bold text-slate-800">Riwayat Transaksi</h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <Filter size={16} className="ml-2 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter rentang waktu"
              className="cursor-pointer border-none bg-transparent text-sm font-medium text-slate-700 focus:ring-0"
            >
              <option value="Semua">Semua Waktu</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Pekan Ini (7 Hari Terakhir)">Pekan Ini (7 Hari Terakhir)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleDownloadPDF}
            onMouseEnter={preparePdf}
            onFocus={preparePdf}
            onTouchStart={preparePdf}
            disabled={isExporting}
            aria-busy={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-emerald-700 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {isExporting ? 'Memproses PDF…' : 'Unduh Laporan PDF'}
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 p-0 shadow-sm dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left font-semibold text-slate-600">
                <th scope="col" className="px-4 py-3">Tanggal</th>
                <th scope="col" className="px-4 py-3">Keterangan</th>
                <th scope="col" className="px-4 py-3">Kategori</th>
                <th scope="col" className="px-4 py-3 text-right">Nominal</th>
                <th scope="col" className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kasTerfilter.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada transaksi pada rentang waktu ini.
                  </td>
                </tr>
              )}
              {kasTerfilter.map((k) => (
                <KasRow key={k.id} k={k} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}