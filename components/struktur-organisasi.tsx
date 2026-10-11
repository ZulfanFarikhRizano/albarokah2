"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Phone, Rows3, Search, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

export type PengurusRow = {
  id: string;
  nama: string | null;
  jabatan: string;
  seksi: string | null;
  kelompok: "penasehat" | "inti" | "seksi";
  urutan: number;
  telepon: string | null;
};

// Urutan seksi mengikuti bagan struktur organisasi resmi.
const URUTAN_SEKSI = [
  "Seksi Sosial",
  "Seksi Keamanan",
  "Seksi Dakwah",
  "Seksi Majelis Ta'lim",
  "Seksi Umum",
  "Seksi Sarana & Prasarana",
  "Seksi Marbot",
  "Seksi Pendidikan & TPA",
];
const idxSeksi = (s: string) => {
  const i = URUTAN_SEKSI.indexOf(s);
  return i === -1 ? URUTAN_SEKSI.length : i;
};
const URUTAN_JABATAN_INTI = ["Ketua DKM", "Sekretaris", "Bendahara"];

const Nama = ({ nama }: { nama: string | null }) =>
  nama ? <span className="font-medium text-foreground">{nama}</span> : <span className="italic text-foreground/40">Belum diisi</span>;

const Kontak = ({ telepon }: { telepon: string | null }) =>
  telepon ? (
    <a href={`tel:${telepon.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 text-primary-700 hover:underline">
      <Phone size={13} /> {telepon}
    </a>
  ) : (
    <span className="text-foreground/30">—</span>
  );

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/50";

function TabelKelompok({
  caption,
  rows,
  tampilKontak,
}: {
  caption: string;
  rows: PengurusRow[];
  tampilKontak: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th scope="col" className={cn(th, "w-12")}>No</th>
            <th scope="col" className={th}>Nama</th>
            <th scope="col" className={th}>Jabatan</th>
            {tampilKontak && <th scope="col" className={th}>Kontak</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-b border-border last:border-0 hover:bg-primary-50/50">
              <td className="tabular px-4 py-3 text-foreground/50">{i + 1}</td>
              <td className="px-4 py-3"><Nama nama={r.nama} /></td>
              <td className="px-4 py-3 text-foreground/70">{r.jabatan}</td>
              {tampilKontak && <td className="px-4 py-3"><Kontak telepon={r.telepon} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StrukturOrganisasi({ data }: { data: PengurusRow[] }) {
  const [q, setQ] = useState("");
  const [tampilan, setTampilan] = useState<"seksi" | "tabel">("seksi");

  const { inti, penasehat, seksi, semua, total, jumlahSeksi } = useMemo(() => {
    const kata = q.trim().toLowerCase();
    const cocok = (r: PengurusRow) =>
      !kata || [r.nama, r.jabatan, r.seksi].some((v) => (v ?? "").toLowerCase().includes(kata));

    const filtered = data.filter(cocok);
    const inti = filtered
      .filter((r) => r.kelompok === "inti")
      .sort((a, b) => {
        const ia = URUTAN_JABATAN_INTI.indexOf(a.jabatan);
        const ib = URUTAN_JABATAN_INTI.indexOf(b.jabatan);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.urutan - b.urutan;
      });
    const penasehat = filtered.filter((r) => r.kelompok === "penasehat").sort((a, b) => a.urutan - b.urutan);

    const map = new Map<string, PengurusRow[]>();
    filtered
      .filter((r) => r.kelompok === "seksi")
      .forEach((r) => map.set(r.seksi ?? "Lainnya", [...(map.get(r.seksi ?? "Lainnya") ?? []), r]));
    const seksi = [...map.entries()]
      .map(([nama, rows]) => ({ nama, rows: rows.sort((a, b) => a.urutan - b.urutan) }))
      .sort((a, b) => idxSeksi(a.nama) - idxSeksi(b.nama) || a.nama.localeCompare(b.nama));

    const semua = [
      ...inti.map((r) => ({ ...r, bidang: "Pengurus Inti" })),
      ...seksi.flatMap((s) => s.rows.map((r) => ({ ...r, bidang: s.nama }))),
      ...penasehat.map((r) => ({ ...r, bidang: "Dewan Penasehat" })),
    ];

    return {
      inti,
      penasehat,
      seksi,
      semua,
      total: data.filter((r) => r.nama).length,
      jumlahSeksi: new Set(data.filter((r) => r.kelompok === "seksi").map((r) => r.seksi)).size,
    };
  }, [data, q]);

  const adaKontak = data.some((r) => r.telepon);
  const kosong = semua.length === 0;

  return (
    <div>
      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pengurus & anggota", nilai: total },
          { label: "Seksi", nilai: jumlahSeksi },
          { label: "Masa khidmat", nilai: "2024–2029" },
        ].map((s) => (
          <Card key={s.label} className="p-3.5 text-center sm:p-4">
            <p className="tabular text-lg font-extrabold text-primary-700 sm:text-2xl">{s.nilai}</p>
            <p className="mt-0.5 text-[11px] text-foreground/50 sm:text-xs">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Kontrol */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, jabatan, atau seksi…"
            aria-label="Cari pengurus"
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-500"
          />
        </div>
        <div role="group" aria-label="Pilih tampilan" className="inline-flex self-start rounded-full border border-border bg-muted/60 p-1 text-sm font-semibold">
          {[
            { v: "seksi" as const, label: "Per Seksi", icon: LayoutGrid },
            { v: "tabel" as const, label: "Tabel Lengkap", icon: Rows3 },
          ].map(({ v, label, icon: Icon }) => (
            <button
              key={v}
              type="button"
              aria-pressed={tampilan === v}
              onClick={() => setTampilan(v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors",
                tampilan === v ? "bg-primary-600 text-white" : "text-foreground/60 hover:text-foreground"
              )}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {kosong ? (
          <EmptyState
            icon={Users}
            title={q ? "Tidak ada yang cocok" : "Data pengurus belum diisi"}
            hint={q ? "Coba kata kunci lain." : "Pengurus dapat mengisinya dari Panel Admin."}
          />
        ) : tampilan === "tabel" ? (
          <Card className="overflow-hidden p-0">
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full min-w-[560px] text-sm">
                <caption className="sr-only">Daftar lengkap pengurus DKM Masjid Jami&apos; Al Barokah</caption>
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted">
                    <th scope="col" className={cn(th, "w-12")}>No</th>
                    <th scope="col" className={th}>Nama</th>
                    <th scope="col" className={th}>Jabatan</th>
                    <th scope="col" className={th}>Bidang</th>
                    {adaKontak && <th scope="col" className={th}>Kontak</th>}
                  </tr>
                </thead>
                <tbody>
                  {semua.map((r, i) => (
                    <tr key={r.id} className="border-b border-border last:border-0 even:bg-muted/30 hover:bg-primary-50/50">
                      <td className="tabular px-4 py-3 text-foreground/50">{i + 1}</td>
                      <td className="px-4 py-3"><Nama nama={r.nama} /></td>
                      <td className="px-4 py-3 text-foreground/70">{r.jabatan}</td>
                      <td className="px-4 py-3">
                        <Badge tone={r.kelompok === "inti" ? "green" : r.kelompok === "penasehat" ? "yellow" : "neutral"}>
                          {r.bidang}
                        </Badge>
                      </td>
                      {adaKontak && <td className="px-4 py-3"><Kontak telepon={r.telepon} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {inti.length > 0 && (
              <section aria-labelledby="h-inti">
                <h3 id="h-inti" className="mb-3 text-sm font-bold uppercase tracking-wide text-primary-900">Pengurus Inti</h3>
                <Card className="overflow-hidden p-0">
                  <TabelKelompok caption="Pengurus inti DKM" rows={inti} tampilKontak={adaKontak} />
                </Card>
              </section>
            )}

            {penasehat.length > 0 && (
              <section aria-labelledby="h-penasehat">
                <h3 id="h-penasehat" className="mb-3 text-sm font-bold uppercase tracking-wide text-primary-900">Dewan Penasehat</h3>
                <Card className="overflow-hidden p-0">
                  <TabelKelompok caption="Dewan penasehat DKM" rows={penasehat} tampilKontak={adaKontak} />
                </Card>
              </section>
            )}

            {seksi.length > 0 && (
              <section aria-labelledby="h-seksi">
                <h3 id="h-seksi" className="mb-3 text-sm font-bold uppercase tracking-wide text-primary-900">Seksi-seksi</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {seksi.map((s) => (
                    <Card key={s.nama} className="overflow-hidden p-0">
                      <div className="flex items-center justify-between gap-2 border-b border-border bg-primary-50/60 px-4 py-3">
                        <h4 className="font-bold text-primary-900">{s.nama}</h4>
                        <Badge tone="green">{s.rows.length} orang</Badge>
                      </div>
                      <TabelKelompok caption={`Anggota ${s.nama}`} rows={s.rows} tampilKontak={adaKontak} />
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
