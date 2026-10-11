import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Amiri } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import type { Viewport } from "next";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "DKM Masjid Jami' Al Barokah",
  description:
    "Transparansi kas, jadwal sholat, infaq digital, dan informasi kegiatan DKM Masjid Jami' Al Barokah, Tajur Halang, Kabupaten Bogor.",
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
};

// Dijalankan sebelum React hydrate & sebelum cat pertama, supaya tidak ada
// "flash" tema salah saat halaman dibuka (baca preferensi tersimpan dulu,
// baru default ke preferensi sistem).
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn(plusJakarta.variable, amiri.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <a href="#konten" className="skip-link">
          Lompat ke konten utama
        </a>
        <Navbar />
        <main id="konten">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
