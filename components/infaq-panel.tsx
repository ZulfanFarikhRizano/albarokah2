"use client";

import { useState } from "react";
import { Check, Copy, Landmark, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { formatRupiah } from "@/lib/utils";

const PILIHAN = [10000, 50000, 100000, 250000];

export function InfaqPanel({
  bank,
  rekening,
  atasNama,
  qrisUrl,
}: {
  bank: string;
  rekening: string;
  atasNama: string;
  qrisUrl: string;
}) {
  const [nominal, setNominal] = useState<number | null>(50000);
  const [lain, setLain] = useState("");
  const [tersalin, setTersalin] = useState<"rek" | "nom" | null>(null);

  if (!qrisUrl && !rekening) {
    return (
      <EmptyState
        icon={Landmark}
        title="Informasi infaq belum tersedia"
        hint="Pengurus DKM belum mengisi QRIS dan nomor rekening resmi. Silakan hubungi pengurus."
      />
    );
  }

  const nilai = nominal ?? (Number(lain.replace(/\D/g, "")) || 0);

  const salin = async (teks: string, tipe: "rek" | "nom") => {
    try {
      await navigator.clipboard.writeText(teks);
      setTersalin(tipe);
      setTimeout(() => setTersalin(null), 1800);
    } catch {
      // Clipboard tidak tersedia — abaikan, tombol bisa dicoba lagi.
    }
  };

  const chip = (aktif: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
      aktif ? "border-primary-600 bg-primary-600 text-white" : "border-border bg-background text-foreground hover:border-primary-400"
    }`;

  return (
    <Card className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-start">
      <div className="flex flex-col items-center gap-2">
        {qrisUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrisUrl}
            alt="Kode QRIS infaq digital DKM Masjid Jami' Al Barokah"
            className="h-52 w-52 rounded-2xl border border-border bg-white object-contain p-2"
          />
        ) : (
          <div className="flex h-52 w-52 items-center justify-center rounded-2xl border border-dashed border-border text-foreground/30">
            <QrCode size={48} strokeWidth={1.2} />
          </div>
        )}
        {qrisUrl && <p className="text-xs text-foreground/50">Scan dengan aplikasi bank / e-wallet</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground/80">Pilih nominal</p>
        <div role="group" aria-label="Pilihan nominal infaq" className="flex flex-wrap gap-2">
          {PILIHAN.map((n) => (
            <button key={n} type="button" aria-pressed={nominal === n} onClick={() => setNominal(n)} className={chip(nominal === n)}>
              {formatRupiah(n)}
            </button>
          ))}
          <button type="button" aria-pressed={nominal === null} onClick={() => setNominal(null)} className={chip(nominal === null)}>
            Nominal lain
          </button>
        </div>

        {nominal === null && (
          <input
            inputMode="numeric"
            value={lain}
            onChange={(e) => setLain(e.target.value.replace(/\D/g, ""))}
            placeholder="Ketik nominal, contoh 75000"
            aria-label="Nominal infaq lainnya"
            className="mt-3 w-full max-w-xs rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary-500"
          />
        )}

        {nilai > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-foreground/60">Nominal infaq:</span>
            <strong className="tabular">{formatRupiah(nilai)}</strong>
            <button
              type="button"
              onClick={() => salin(String(nilai), "nom")}
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
            >
              {tersalin === "nom" ? <Check size={12} className="text-primary-600" /> : <Copy size={12} />}
              {tersalin === "nom" ? "Tersalin" : "Salin"}
            </button>
          </div>
        )}

        {rekening && (
          <div className="mt-6 rounded-2xl bg-muted/60 p-4">
            <p className="text-sm text-foreground/60">
              {[bank, atasNama && `a.n. ${atasNama}`].filter(Boolean).join(" · ") || "Transfer bank"}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <code className="tabular rounded-lg bg-background px-2.5 py-1.5 text-base font-semibold">{rekening}</code>
              <button
                type="button"
                onClick={() => salin(rekening.replace(/\s/g, ""), "rek")}
                aria-label="Salin nomor rekening"
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                {tersalin === "rek" ? <Check size={13} className="text-primary-600" /> : <Copy size={13} />}
                {tersalin === "rek" ? "Tersalin" : "Salin"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
