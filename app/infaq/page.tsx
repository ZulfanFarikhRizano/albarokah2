import { PageHeader } from "@/components/page-header";
import { DbNotice } from "@/components/db-notice";
import { InfaqPanel } from "@/components/infaq-panel";
import { getPengaturan } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Infaq Digital — DKM Masjid Jami' Al Barokah" };

export default async function InfaqPage() {
  const { data: p, error } = await getPengaturan();
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <PageHeader title="Infaq Digital" description="Scan QRIS atau salin nomor rekening resmi DKM untuk berinfaq." />
      <DbNotice error={error} />
      <InfaqPanel bank={p.bank} rekening={p.rekening} atasNama={p.atasNama} qrisUrl={p.qrisUrl} />
    </div>
  );
}
