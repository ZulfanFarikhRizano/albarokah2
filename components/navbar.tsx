import Link from "next/link";
import Header from "@/components/ui/curved-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { BackButton } from "@/components/back-button";
import { Logo } from "@/components/logo";
import { MENU_UTAMA, SITE } from "@/lib/site";

const navItems = [
  { heading: "Beranda", href: "/", subheading: "Kembali ke halaman utama" },
  ...MENU_UTAMA.map((m) => ({ heading: m.label, href: m.href, subheading: m.deskripsi })),
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-5">
        <BackButton />
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5 font-extrabold text-primary-900">
          <Logo size={34} priority />
          <span className="truncate text-[15px]">{SITE.nama}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Header navItems={navItems} />
        </div>
      </div>
    </header>
  );
}