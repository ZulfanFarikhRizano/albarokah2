import Link from "next/link";
import { CalendarRange, MapPin } from "lucide-react";
import { Logo } from "@/components/logo";
import { getPengaturan } from "@/lib/data";
import { SITE } from "@/lib/site";

export async function Footer() {
  const { data: p } = await getPengaturan();

  // Fitur musiman hanya muncul saat diaktifkan pengurus (Admin > Pengaturan).
  const musiman = [
    ...(p.zakatAktif ? [{ label: "Zakat & BAZNAS", href: "/zakat" }] : []),
    ...(p.kurbanAktif ? [{ label: "Data Kurban", href: "/kurban" }] : []),
  ];

  return (
    <footer className="mt-16 border-t border-border bg-muted/60">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-sm items-start gap-3">
            <Logo size={44} />
            <div>
              <p className="font-extrabold text-primary-900">{SITE.namaDKM}</p>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-foreground/60">
                <MapPin size={14} className="mt-1 shrink-0" />
                <span>{SITE.alamat}</span>
              </p>
            </div>
          </div>

          <nav aria-label="Layanan lainnya" className="flex flex-col gap-2 text-sm">
            <p className="font-semibold text-foreground/80">Layanan lainnya</p>
            <Link href="/booking" className="inline-flex items-center gap-2 font-medium text-primary-700 hover:underline">
              <CalendarRange size={15} /> Booking Fasilitas
            </Link>
            {musiman.map((m) => (
              <Link key={m.href} href={m.href} className="text-foreground/70 hover:text-primary-700">
                {m.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-xs text-foreground/50">
          <span>
            © {new Date().getFullYear()} {SITE.namaDKM} · Masa Khidmat {SITE.masaKhidmat}
          </span>
          <Link href="/admin" className="hover:text-primary-700">
            Masuk sebagai Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
