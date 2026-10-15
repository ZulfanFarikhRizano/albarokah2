import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Amiri } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

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

// Metadata Aplikasi + Konfigurasi PWA untuk iOS/Android
export const metadata: Metadata = {
  title: "DKM Masjid Jami' Al Barokah",
  description:
    "Transparansi kas, jadwal sholat, infaq digital, dan informasi kegiatan DKM Masjid Jami' Al Barokah, Tajur Halang, Kabupaten Bogor.",
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Al Barokah",
  },
  formatDetection: {
    telephone: false,
  },
};

// Pengaturan Viewport & Warna Tema PWA di Bar HP
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#15803d", // Warna hijau khas Masjid Al Barokah
};

// Skrip inisialisasi tema (Anti-flash dark mode)
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

// Skrip pendaftaran Service Worker untuk fitur install PWA
const swRegisterScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function(err) {
      console.log('Service Worker registration failed: ', err);
    });
  });
}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn(plusJakarta.variable, amiri.variable)} suppressHydrationWarning>
      <head>
        {/* Anti-flash dark mode */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <a href="#konten" className="skip-link">
          Lompat ke konten utama
        </a>
        <Navbar />
        <main id="konten">{children}</main>
        <Footer />

        {/* Pendaftaran Service Worker PWA saat client selesai memuat */}
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
      </body>
    </html>
  );
}