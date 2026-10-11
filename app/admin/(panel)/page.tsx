import Link from "next/link";
import { Card } from "@/components/ui/card";
import { DbNotice } from "@/components/db-notice";
import { formatRupiah } from "@/lib/utils";
import { getBooking, getKas, getPengajian, getPengurus, getSaran, getWarta, ringkasKas } from "@/lib/data";

export default async function AdminDashboard() {
  const [kas, saran, booking, pengajian, warta, pengurus] = await Promise.all([
    getKas(), getSaran(), getBooking(), getPengajian(), getWarta(), getPengurus(),
  ]);
  const error = [kas, saran, booking, pengajian, warta, pengurus].find((r) => r.error)?.error ?? null;

  const stats = [
    { label: "Saldo Kas", value: formatRupiah(ringkasKas(kas.data).saldo), href: "/admin/kas" },
    { label: "Saran Baru", value: saran.data.filter((s) => s.status === "Baru").length, href: "/admin/saran" },
    { label: "Booking Menunggu", value: booking.data.filter((b) => b.status === "Menunggu").length, href: "/admin/booking" },
    { label: "Pengajian Mendatang", value: pengajian.data.length, href: "/admin/pengajian" },
    { label: "Warta Tayang", value: warta.data.length, href: "/admin/warta" },
    { label: "Pengurus Tercatat", value: pengurus.data.length, href: "/admin/pengurus" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900">Dashboard</h1>
      <DbNotice error={error} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-4 transition-colors hover:border-primary-400">
              <p className="text-xs text-foreground/50">{s.label}</p>
              <p className="tabular mt-1 text-lg font-bold text-primary-800">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
