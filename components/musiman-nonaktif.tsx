import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MusimanNonaktif({ nama }: { nama: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-500">
        <Sparkles size={22} />
      </span>
      <h1 className="mt-4 text-xl font-extrabold text-primary-900">{nama} belum dibuka</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Ini adalah layanan musiman. Halaman akan tersedia saat pengurus DKM membuka {nama} menjelang waktunya.
      </p>
      <Button href="/" variant="outline" className="mt-6">Kembali ke Beranda</Button>
    </div>
  );
}
