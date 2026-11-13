'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { HapusButton } from "@/components/admin/hapus-button";
import { useToast } from "@/components/admin/toast";
import { formatRupiah, hariIniWIB } from "@/lib/utils";
import { deleteKasAction } from "@/lib/actions";
import { FileText, Filter, Loader2 } from 'lucide-react';

type Kas = { id: string; tanggal: string; keterangan: string; kategori: string; nominal: number };

// Formatter dibuat SEKALI. Sebelumnya toLocaleDateString() membuat objek Intl baru
// untuk setiap baris di setiap render -> filter terasa berat kalau transaksi banyak.
const fmtPanjang = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtPendek = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
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
  const [filterType, setFilterType] = useState('Semua');
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();
  const logoRef = useRef<Promise<HTMLImageElement | null> | null>(null);

  // Hasil filter dihitung langsung (useMemo), bukan useEffect + setState yang memicu render ganda.
  // Perbandingan memakai teks tanggal YYYY-MM-DD (WIB) sehingga tidak perlu parsing Date per baris.
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
      logoRef.current = new Promise<HTMLImageElement | null>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = '/images/logo.png';
      });
    }
    return logoRef.current;
  };

  // Siapkan pustaka PDF (jspdf) + logo saat browser sedang menganggur, jadi klik pertama
  // pada "Unduh Laporan PDF" tidak lagi menunggu unduhan ratusan KB.
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
    // Beri browser kesempatan menggambar spinner sebelum pekerjaan berat dimulai.
    await new Promise((r) => setTimeout(r, 30));

    try {
      const [{ jsPDF }, autoTableMod, img] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        loadLogo(),
      ]);
      const autoTable = autoTableMod.default;

      const doc = new jsPDF('p', 'mm', 'a4');

      if (img) {
        try {
          doc.addImage(img, 'PNG', 14, 12, 18, 18);
        } catch {
          console.warn('Logo gagal dirender ke PDF');
        }
      }

      // Kop Surat
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("Laporan Kas Masjid Jami' Al Barokah", 36, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Periode Laporan: ${filterType}`, 36, 24);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} | Oleh: Bendahara DKM`, 36, 29);

      // Garis Pemisah
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 34, 196, 34);

      // Data Tabel
      let totalPemasukan = 0;
      let totalPengeluaran = 0;

      const tableData = kasTerfilter.map((k) => {
        const isPemasukan = k.kategori.includes('Pemasukan');
        const pemasukan = isPemasukan ? k.nominal : 0;
        const pengeluaran = !isPemasukan ? k.nominal : 0;

        totalPemasukan += pemasukan;
        totalPengeluaran += pengeluaran;

        return [
          tgl(k.tanggal, fmtPendek),
          k.keterangan,
          k.kategori,
          isPemasukan ? formatRupiah(pemasukan) : '-',
          !isPemasukan ? formatRupiah(pengeluaran) : '-',
        ];
      });

      autoTable(doc, {
        startY: 40,
        head: [['Tanggal', 'Keterangan', 'Kategori', 'Pemasukan', 'Pengeluaran']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [5, 150, 105],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35 },
          3: { cellWidth: 32, halign: 'right' },
          4: { cellWidth: 32, halign: 'right' },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        foot: [
          [
            { content: 'TOTAL KESELURUHAN', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatRupiah(totalPemasukan), styles: { halign: 'right', textColor: [5, 150, 105] } },
            { content: formatRupiah(totalPengeluaran), styles: { halign: 'right', textColor: [225, 29, 72] } },
          ],
          [
            { content: 'SALDO BERSIH PERIODE INI', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 10 } },
            { content: formatRupiah(totalPemasukan - totalPengeluaran), colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 10 } },
          ],
        ],
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
        },
      });

      const namaFile = `Laporan_Kas_AlBarokah_${filterType.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
      doc.save(namaFile);
      toast.success('Laporan PDF berhasil dibuat.');
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

        {/* Kontrol Filter & Download */}
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