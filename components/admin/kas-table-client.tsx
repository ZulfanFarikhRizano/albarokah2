
'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { HapusButton } from '@/components/admin/hapus-button';
import { useToast } from '@/components/admin/toast';
import { formatRupiah, hariIniWIB } from '@/lib/utils';
import { deleteKasAction } from '@/lib/actions';
import {
  FileText,
  Filter,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  CalendarDays,
  ReceiptText,
  TrendingUp,
  Download,
  CircleDollarSign,
  ChartNoAxesCombined,
} from 'lucide-react';

type Kas = {
  id: string;
  tanggal: string;
  keterangan: string;
  kategori: string;
  nominal: number;
};

type FilterType = 'Semua' | 'Bulan Ini' | 'Pekan Ini (7 Hari Terakhir)';

const fmtPanjang = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const tgl = (iso: string) =>
  fmtPanjang.format(new Date(`${iso}T00:00:00Z`));

const isMasuk = (k: Kas) => k.kategori.includes('Pemasukan');

const getSaldo = (data: Kas[]) =>
  data.reduce(
    (total, k) => total + (isMasuk(k) ? k.nominal : -k.nominal),
    0
  );

const getRentang = (filter: FilterType, hariIni: string) => {
  if (filter === 'Semua') return 'Seluruh periode transaksi';

  const end = hariIni;

  if (filter === 'Bulan Ini') {
    const start = `${hariIni.slice(0, 7)}-01`;
    return `${tgl(start)} – ${tgl(end)}`;
  }

  const d = new Date(`${hariIni}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 6);

  return `${tgl(d.toISOString().slice(0, 10))} – ${tgl(end)}`;
};

const KasRow = memo(function KasRow({ k }: { k: Kas }) {
  const masuk = isMasuk(k);
  const qris = k.kategori.includes('QRIS');

  return (
    <tr className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-emerald-50/40">
      <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-500">
        {tgl(k.tanggal)}
      </td>

      <td className="px-5 py-4">
        <span className="font-semibold text-slate-800">
          {k.keterangan}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${
            qris
              ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100'
              : masuk
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
              : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              qris ? 'bg-sky-500' : masuk ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          {k.kategori}
        </span>
      </td>

      <td
        className={`whitespace-nowrap px-5 py-4 text-right font-bold tabular-nums ${
          masuk ? 'text-emerald-600' : 'text-rose-600'
        }`}
      >
        {masuk ? '+' : '-'}{formatRupiah(k.nominal)}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end">
          <HapusButton
            action={deleteKasAction.bind(null, k.id)}
            label={`Hapus transaksi ${k.keterangan}`}
          />
        </div>
      </td>
    </tr>
  );
});

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  description,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: 'green' | 'red' | 'slate';
  description: string;
}) {
  const styles = {
    green: {
      icon: 'bg-emerald-50 text-emerald-600',
      value: 'text-emerald-700',
    },
    red: {
      icon: 'bg-rose-50 text-rose-600',
      value: 'text-rose-600',
    },
    slate: {
      icon: 'bg-slate-100 text-slate-600',
      value: 'text-slate-800',
    },
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">
            {label}
          </p>
          <p className={`mt-2 break-words text-lg font-bold tracking-tight tabular-nums sm:text-xl ${styles[color].value}`}>
            {value}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles[color].icon}`}>
          <Icon size={19} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}

export function KasTableClient({ initialData }: { initialData: Kas[] }) {
  const [filterType, setFilterType] = useState<FilterType>(
    'Pekan Ini (7 Hari Terakhir)'
  );
  const [isExporting, setIsExporting] = useState(false);

  const toast = useToast();
  const logoRef = useRef<Promise<string | null> | null>(null);

  const hariIni = hariIniWIB();

  const kasTerfilter = useMemo(() => {
    if (filterType === 'Semua') return initialData;

    if (filterType === 'Bulan Ini') {
      const bulan = hariIni.slice(0, 7);

      return initialData.filter(
        (k) => k.tanggal.slice(0, 7) === bulan && k.tanggal <= hariIni
      );
    }

    const d = new Date(`${hariIni}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 6);

    const batas = d.toISOString().slice(0, 10);

    return initialData.filter(
      (k) => k.tanggal >= batas && k.tanggal <= hariIni
    );
  }, [filterType, initialData, hariIni]);

  const statistik = useMemo(() => {
    const pemasukan = kasTerfilter
      .filter(isMasuk)
      .reduce((a, b) => a + b.nominal, 0);

    const pengeluaran = kasTerfilter
      .filter((k) => !isMasuk(k))
      .reduce((a, b) => a + b.nominal, 0);

    const saldoAwal =
      filterType === 'Semua'
        ? 0
        : getSaldo(initialData.filter((k) => {
            const start =
              filterType === 'Bulan Ini'
                ? `${hariIni.slice(0, 7)}-01`
                : (() => {
                    const d = new Date(`${hariIni}T00:00:00Z`);
                    d.setUTCDate(d.getUTCDate() - 6);
                    return d.toISOString().slice(0, 10);
                  })();

            return k.tanggal < start;
          }));

    return {
      pemasukan,
      pengeluaran,
      saldoAwal,
      saldoAkhir: saldoAwal + pemasukan - pengeluaran,
      jumlah: kasTerfilter.length,
    };
  }, [kasTerfilter, initialData, filterType, hariIni]);

  const loadLogo = () => {
    if (!logoRef.current) {
      logoRef.current = new Promise<string | null>((resolve) => {
        const img = new window.Image();

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 160;
            canvas.getContext('2d')?.drawImage(img, 0, 0, 160, 160);
            resolve(canvas.toDataURL('image/png'));
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

    const timer = setTimeout(preparePdf, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadPDF = async () => {
    if (isExporting) return;

    if (!kasTerfilter.length) {
      toast.error('Tidak ada data untuk diunduh pada periode ini.');
      return;
    }

    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 30));

    try {
      const [{ jsPDF }, autoTableMod, logo] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
        loadLogo(),
      ]);

      const autoTable = autoTableMod.default;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const hariIni = hariIniWIB();

      const startDate = (() => {
        if (filterType === 'Semua') return null;

        if (filterType === 'Bulan Ini') {
          return `${hariIni.slice(0, 7)}-01`;
        }

        const d = new Date(`${hariIni}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() - 6);
        return d.toISOString().slice(0, 10);
      })();

      const namaPeriode =
        filterType === 'Semua'
          ? 'Keseluruhan'
          : filterType === 'Bulan Ini'
          ? 'Bulanan'
          : 'Pekan Ini';

      const judul =
        filterType === 'Semua'
          ? 'LAPORAN KEUANGAN KESELURUHAN'
          : filterType === 'Bulan Ini'
          ? 'LAPORAN KEUANGAN BULANAN'
          : 'LAPORAN KEUANGAN PEKAN INI';

      const tanggalPeriode = startDate
        ? `${tgl(startDate)} – ${tgl(hariIni)}`
        : 'Seluruh periode transaksi';

      const saldoAwal =
        filterType === 'Semua'
          ? 0
          : getSaldo(initialData.filter((k) => k.tanggal < startDate!));

      const pemasukanList = kasTerfilter.filter(isMasuk);
      const pengeluaranList = kasTerfilter.filter((k) => !isMasuk(k));

      const totalPemasukan = pemasukanList.reduce(
        (sum, k) => sum + k.nominal,
        0
      );

      const totalPengeluaran = pengeluaranList.reduce(
        (sum, k) => sum + k.nominal,
        0
      );

      const saldoAkhir =
        saldoAwal + totalPemasukan - totalPengeluaran;

      const tanggalCetak = tgl(hariIni);

      // HEADER DOKUMEN
      doc.setFillColor(5, 150, 105);
      doc.rect(0, 0, pageWidth, 4, 'F');

      if (logo) {
        try {
          doc.addImage(logo, 'PNG', 14, 11, 19, 19, undefined, 'FAST');
        } catch {
          console.warn('Logo tidak dapat dimuat.');
        }
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text("MASJID JAMI' AL BAROKAH", 37, 17);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Perumahan Inkopad Blok D, Sasak Panjang, Tajur Halang, Kab. Bogor',
        37,
        22
      );
      doc.text(
        `Dicetak: ${tanggalCetak} | Bendahara DKM`,
        37,
        27
      );

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.line(14, 34, 196, 34);

      // JUDUL
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(judul, pageWidth / 2, 44, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(tanggalPeriode, pageWidth / 2, 50, {
        align: 'center',
      });

      // TABEL PEMASUKAN
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      doc.text('A. SALDO AWAL & PEMASUKAN', 14, 60);

      const bodyPemasukan = [
        [
          '1',
          'Saldo Awal Periode',
          filterType === 'Semua'
            ? '—'
            : formatRupiah(saldoAwal),
        ],
        ...pemasukanList.map((k, i) => [
          String(i + 2),
          k.keterangan,
          formatRupiah(k.nominal),
        ]),
      ];

      autoTable(doc, {
        startY: 63,
        margin: { left: 14, right: 14, bottom: 18 },
        head: [['No', 'Uraian / Keterangan', 'Jumlah (Rp)']],
        body: bodyPemasukan,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8.5,
          cellPadding: 3,
          textColor: [51, 65, 85],
          lineColor: [226, 232, 240],
          lineWidth: 0.15,
          valign: 'middle',
        },
        headStyles: {
          fillColor: [5, 150, 105],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          cellPadding: 3.5,
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 45, halign: 'right' },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        foot: [
          ['', 'TOTAL PEMASUKAN', formatRupiah(totalPemasukan)],
        ],
        footStyles: {
          fillColor: [236, 253, 245],
          textColor: [5, 120, 87],
          fontStyle: 'bold',
        },
        didParseCell(data: any) {
          if (data.section === 'foot' && data.column.index === 1) {
            data.cell.styles.halign = 'right';
          }
        },
      });

      // TABEL PENGELUARAN
      let finalY = (doc as any).lastAutoTable.finalY || 70;

      if (finalY + 30 > pageHeight - 18) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(225, 29, 72);
      doc.text('B. PENGELUARAN', 14, finalY + 9);

      autoTable(doc, {
        startY: finalY + 12,
        margin: { left: 14, right: 14, bottom: 18 },
        head: [['No', 'Uraian / Keterangan', 'Jumlah (Rp)']],
        body: pengeluaranList.length
          ? pengeluaranList.map((k, i) => [
              String(i + 1),
              k.keterangan,
              formatRupiah(k.nominal),
            ])
          : [['—', 'Tidak ada pengeluaran pada periode ini', '—']],
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8.5,
          cellPadding: 3,
          textColor: [51, 65, 85],
          lineColor: [226, 232, 240],
          lineWidth: 0.15,
          valign: 'middle',
        },
        headStyles: {
          fillColor: [225, 29, 72],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          cellPadding: 3.5,
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 45, halign: 'right' },
        },
        alternateRowStyles: {
          fillColor: [255, 247, 248],
        },
        foot: [
          ['', 'TOTAL PENGELUARAN', formatRupiah(totalPengeluaran)],
        ],
        footStyles: {
          fillColor: [255, 241, 242],
          textColor: [190, 24, 93],
          fontStyle: 'bold',
        },
        didParseCell(data: any) {
          if (data.section === 'foot' && data.column.index === 1) {
            data.cell.styles.halign = 'right';
          }
        },
      });

      // RINGKASAN SALDO
      finalY = (doc as any).lastAutoTable.finalY || finalY + 20;

      if (finalY + 85 > pageHeight - 15) {
        doc.addPage();
        finalY = 20;
      }

      const boxY = finalY + 9;

      doc.setDrawColor(16, 185, 129);
      doc.setFillColor(240, 253, 248);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, boxY, 182, 39, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(4, 120, 87);
      doc.text('RINGKASAN KEUANGAN', 19, boxY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);

      doc.text('Saldo awal periode', 19, boxY + 14);
      doc.text('Total pemasukan', 19, boxY + 20);
      doc.text('Total pengeluaran', 19, boxY + 26);

      doc.setFont('helvetica', 'bold');
      doc.text(
        filterType === 'Semua' ? '—' : formatRupiah(saldoAwal),
        190,
        boxY + 14,
        { align: 'right' }
      );
      doc.setTextColor(5, 150, 105);
      doc.text(formatRupiah(totalPemasukan), 190, boxY + 20, {
        align: 'right',
      });

      doc.setTextColor(225, 29, 72);
      doc.text(formatRupiah(totalPengeluaran), 190, boxY + 26, {
        align: 'right',
      });

      doc.setDrawColor(167, 243, 208);
      doc.line(19, boxY + 29, 190, boxY + 29);

      doc.setFontSize(9);
      doc.setTextColor(4, 120, 87);
      doc.text('SALDO AKHIR KAS MASJID', 19, boxY + 35);

      doc.setFontSize(12);
      doc.text(formatRupiah(saldoAkhir), 190, boxY + 35, {
        align: 'right',
      });

      // PENGESAHAN
      const ttdY = boxY + 52;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);

      doc.text('Mengetahui,', 151, ttdY, { align: 'center' });
      doc.text('Bendahara DKM', 151, ttdY + 5, {
        align: 'center',
      });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text('( Pengurus / Bendahara )', 151, ttdY + 24, {
        align: 'center',
      });

      // NOMOR HALAMAN
      const totalHalaman = doc.getNumberOfPages();

      for (let i = 1; i <= totalHalaman; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Masjid Jami' Al Barokah  •  Halaman ${i} dari ${totalHalaman}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      doc.setProperties({
        title: judul,
        subject: `Laporan keuangan ${namaPeriode}`,
        author: "Masjid Jami' Al Barokah",
        creator: 'Sistem Keuangan DKM',
      });

      doc.save(`Laporan Keuangan Al-Barokah-${namaPeriode}.pdf`);
      toast.success('Laporan keuangan berhasil dibuat.');

    } catch (error) {
      console.error('Gagal membuat PDF:', error);
      toast.error('Terjadi kesalahan saat membuat PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="mt-8 space-y-5">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ReceiptText size={19} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Riwayat Transaksi
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Pantau dan kelola seluruh arus kas masjid.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          onMouseEnter={preparePdf}
          onFocus={preparePdf}
          onTouchStart={preparePdf}
          disabled={isExporting || !kasTerfilter.length}
          aria-busy={isExporting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Download size={17} />
          )}
          {isExporting ? 'Membuat PDF...' : 'Unduh Laporan PDF'}
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Pemasukan"
          value={formatRupiah(statistik.pemasukan)}
          icon={ArrowDownLeft}
          color="green"
          description="Transaksi masuk pada periode"
        />

        <StatCard
          label="Total Pengeluaran"
          value={formatRupiah(statistik.pengeluaran)}
          icon={ArrowUpRight}
          color="red"
          description="Transaksi keluar pada periode"
        />

        <StatCard
          label="Saldo Akhir"
          value={formatRupiah(statistik.saldoAkhir)}
          icon={Wallet}
          color="slate"
          description="Saldo setelah seluruh transaksi"
        />
      </div>

      {/* FILTER & TABLE */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-sm">

        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Daftar Transaksi
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {getRentang(filterType, hariIni)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="shrink-0 text-slate-400" />

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as FilterType)
              }
              aria-label="Filter rentang waktu"
              className="min-h-10 flex-1 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:flex-none"
            >
              <option value="Semua">Semua Waktu</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Pekan Ini (7 Hari Terakhir)">
                7 Hari Terakhir
              </option>
            </select>
          </div>
        </div>

        {/* TABLE DESKTOP */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-5 py-3.5">Tanggal</th>
                <th scope="col" className="px-5 py-3.5">Keterangan</th>
                <th scope="col" className="px-5 py-3.5">Kategori</th>
                <th scope="col" className="px-5 py-3.5 text-right">Nominal</th>
                <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {kasTerfilter.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <ReceiptText className="mx-auto mb-3 text-slate-300" size={32} />
                    <p className="text-sm font-semibold text-slate-600">
                      Belum ada transaksi
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Tidak ditemukan transaksi pada periode ini.
                    </p>
                  </td>
                </tr>
              ) : (
                kasTerfilter.map((k) => (
                  <KasRow key={k.id} k={k} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="divide-y divide-slate-100 md:hidden">
          {kasTerfilter.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <ReceiptText className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="text-sm font-semibold text-slate-600">
                Belum ada transaksi
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Tidak ditemukan transaksi pada periode ini.
              </p>
            </div>
          ) : (
            kasTerfilter.map((k) => {
              const masuk = isMasuk(k);

              return (
                <div key={k.id} className="flex items-start gap-3 px-4 py-4">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    masuk
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {masuk ? (
                      <ArrowDownLeft size={19} />
                    ) : (
                      <ArrowUpRight size={19} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-slate-800">
                      {k.keterangan}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {tgl(k.tanggal)}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                      <span className={`text-[10px] font-bold ${
                        masuk ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {k.kategori}
                      </span>
                    </div>

                    <p className={`mt-2 text-sm font-bold tabular-nums ${
                      masuk ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {masuk ? '+' : '-'}{formatRupiah(k.nominal)}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <HapusButton
                      action={deleteKasAction.bind(null, k.id)}
                      label={`Hapus transaksi ${k.keterangan}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER TABLE */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:px-5">
          <span className="text-xs text-slate-500">
            Menampilkan <strong className="text-slate-700">{statistik.jumlah}</strong> transaksi
          </span>

          <span className="text-[11px] font-medium text-slate-400">
            Data keuangan Masjid Al Barokah
          </span>
        </div>
      </Card>
    </section>
  );
}
