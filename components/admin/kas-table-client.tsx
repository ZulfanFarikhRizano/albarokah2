'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { HapusButton } from "@/components/admin/hapus-button";
import { formatRupiah } from "@/lib/utils";
import { deleteKasAction } from "@/lib/actions";
import { FileText, Filter } from 'lucide-react';

export function KasTableClient({ initialData }: { initialData: any[] }) {
  const [kasTerfilter, setKasTerfilter] = useState<any[]>(initialData);
  const [filterType, setFilterType] = useState('Semua');
  const [isExporting, setIsExporting] = useState(false);

  // Logika Filter Rentang Waktu yang Diperbaiki
  useEffect(() => {
    if (filterType === 'Semua') {
      setKasTerfilter(initialData);
      return;
    }

    const now = new Date();

    const filtered = initialData.filter((k) => {
      const tanggalKas = new Date(k.tanggal);
      
      if (filterType === 'Bulan Ini') {
        return tanggalKas.getMonth() === now.getMonth() && tanggalKas.getFullYear() === now.getFullYear();
      }
      
      if (filterType === 'Pekan Ini (7 Hari Terakhir)') {
        // Menghitung mundur tepat 7 hari ke belakang dari hari ini
        const tujuhHariLalu = new Date(now);
        tujuhHariLalu.setDate(now.getDate() - 7);
        tujuhHariLalu.setHours(0, 0, 0, 0);

        const hariIniAkhir = new Date(now);
        hariIniAkhir.setHours(23, 59, 59, 999);

        return tanggalKas >= tujuhHariLalu && tanggalKas <= hariIniAkhir;
      }

      return true;
    });

    setKasTerfilter(filtered);
  }, [filterType, initialData]);

  // Fungsi Download PDF Resmi
  const handleDownloadPDF = async () => {
    if (kasTerfilter.length === 0) {
      alert("Tidak ada data untuk diunduh pada rentang waktu ini.");
      return;
    }

    try {
      setIsExporting(true);
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF('p', 'mm', 'a4');

      // Muat Logo Masjid
      const img = new window.Image();
      img.src = '/images/logo.png';
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      try {
        doc.addImage(img, 'PNG', 14, 12, 18, 18);
      } catch (error) {
        console.warn("Logo gagal dirender ke PDF");
      }

      // Kop Surat
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Laporan Kas Masjid Jami\' Al Barokah', 36, 18);
      
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

      const tableData = kasTerfilter.map(k => {
        const isPemasukan = k.kategori.includes('Pemasukan');
        const pemasukan = isPemasukan ? k.nominal : 0;
        const pengeluaran = !isPemasukan ? k.nominal : 0;
        
        totalPemasukan += pemasukan;
        totalPengeluaran += pengeluaran;

        return [
          new Date(k.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          k.keterangan,
          k.kategori,
          isPemasukan ? formatRupiah(pemasukan) : '-',
          !isPemasukan ? formatRupiah(pengeluaran) : '-'
        ];
      });

      // Render Tabel
      autoTable(doc, {
        startY: 40,
        head: [['Tanggal', 'Keterangan', 'Kategori', 'Pemasukan', 'Pengeluaran']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [5, 150, 105],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35 },
          3: { cellWidth: 32, halign: 'right' },
          4: { cellWidth: 32, halign: 'right' },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        foot: [
          [
            { content: 'TOTAL KESELURUHAN', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatRupiah(totalPemasukan), styles: { halign: 'right', textColor: [5, 150, 105] } },
            { content: formatRupiah(totalPengeluaran), styles: { halign: 'right', textColor: [225, 29, 72] } }
          ],
          [
            { content: 'SALDO BERSIH PERIODE INI', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 10 } },
            { content: formatRupiah(totalPemasukan - totalPengeluaran), colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 10 } }
          ]
        ],
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
        }
      });

      const namaFile = `Laporan_Kas_AlBarokah_${filterType.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
      doc.save(namaFile);

    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 mt-6">
        <h2 className="text-lg font-bold text-slate-800">Riwayat Transaksi</h2>
        
        {/* Kontrol Filter & Download */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <Filter size={16} className="text-slate-500 ml-2" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer"
            >
              <option value="Semua">Semua Waktu</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Pekan Ini (7 Hari Terakhir)">Pekan Ini (7 Hari Terakhir)</option>
            </select>
          </div>

          <button 
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all shadow-sm"
          >
            <FileText size={16} /> 
            {isExporting ? 'Memproses PDF...' : 'Unduh Laporan PDF'}
          </button>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600 font-semibold">
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
                <tr key={k.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="tabular whitespace-nowrap px-4 py-3 text-slate-600">
                    {new Date(k.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{k.keterangan}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      k.kategori.includes('QRIS') 
                        ? 'bg-sky-100 text-sky-700' 
                        : (k.kategori.includes('Pemasukan') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')
                    }`}>
                      {k.kategori}
                    </span>
                  </td>
                  <td className={`tabular px-4 py-3 text-right font-bold ${k.kategori.includes('Pemasukan') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {k.kategori.includes('Pemasukan') ? '+' : '-'}{formatRupiah(k.nominal)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <HapusButton
                        action={deleteKasAction.bind(null, k.id)}
                        label={`Hapus transaksi ${k.keterangan}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}