import Link from "next/link";
import Header from "@/components/ui/curved-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { MENU_UTAMA, SITE } from "@/lib/site";

const navItems = [
  { heading: "Beranda", href: "/", subheading: "Kembali ke halaman utama" },
  ...MENU_UTAMA.map((m) => ({ heading: m.label, href: m.href, subheading: m.deskripsi })),
];

export function Navbar() {
  return (
    <header className="relative z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 font-extrabold text-primary-900">
          <Logo size={34} priority />
          <span className="truncate text-[15px]">{SITE.nama}</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Header navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
