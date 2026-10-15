'use client';

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Mail } from "lucide-react";
import { submitSaranAction } from "@/lib/actions";

export default function SaranPage() {
  const [isiSaran, setIsiSaran] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; message: string } | null>(null);

  const nomorWa = "6285221393635";

  // Fungsi untuk langsung mengarahkan teks ke WhatsApp
  const handleKirimWa = () => {
    if (!isiSaran.trim()) {
      alert("Silakan ketik saran atau laporan Anda terlebih dahulu.");
      return;
    }
    const teksFormat = encodeURIComponent(`Assalamualaikum pengurus DKM Masjid Jami' Al Barokah,\n\nSaya ingin menyampaikan laporan/saran:\n"${isiSaran}"`);
    window.open(`https://wa.me/${nomorWa}?text=${teksFormat}`, "_blank");
  };

  // Fungsi submit form database
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await submitSaranAction(null, formData);
    
    setMessage(res);
    setIsPending(false);
    if (res?.ok) {
      setIsiSaran(""); // Reset teks jika berhasil
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <PageHeader
        title="Kotak Saran & Aspirasi"
        description="Sampaikan aspirasi secara anonim ke database, atau kirim langsung laporan Anda via WhatsApp."
      />
      
      <Card className="p-5">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label htmlFor="isi" className="mb-1.5 block text-sm font-semibold text-foreground/80">
              Tulis Pesan / Laporan Anda
            </label>
            <Textarea 
              id="isi" 
              name="isi" 
              rows={5} 
              required 
              minLength={3} 
              maxLength={1000} 
              placeholder="Contoh: Toilet ada yang rusak, lampu teras mati, dll..." 
              value={isiSaran}
              onChange={(e) => setIsiSaran(e.target.value)}
            />
          </div>

          {/* Honeypot anti-spam */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${message.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.message}
            </div>
          )}

          <p className="text-xs text-foreground/45">
            Pilih metode pengiriman di bawah ini sesuai keinginan Anda:
          </p>

          {/* Tombol Aksi Ganda: Kirim ke Database vs Kirim Langsung ke WhatsApp */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button 
              type="submit" 
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              <Send size={16} /> {isPending ? "Mengirim..." : "Kirim Anonim (Database)"}
            </Button>

            <button
              type="button"
              onClick={handleKirimWa}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
            >
              <MessageCircle size={16} /> Kirim Langsung ke WhatsApp
            </button>
          </div>
        </form>
      </Card>

      {/* Card Info Tambahan */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between text-xs text-slate-500">
        <span>Butuh bantuan mendesak lainnya?</span>
        <a 
          href="mailto:albarokah.blokd@gmail.com" 
          className="inline-flex items-center gap-1.5 font-semibold text-primary-700 hover:underline"
        >
          <Mail size={14} /> albarokah.blokd@gmail.com
        </a>
      </div>

    </div>
  );
}