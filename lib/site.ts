export const SITE = {
  nama: "Masjid Jami' Al Barokah",
  namaDKM: "DKM Masjid Jami' Al Barokah",
  masaKhidmat: "2024 – 2029",
  alamat:
    "Perumahan Inkopad Blok D, Sasak Panjang, Kec. Tajur Halang, Kabupaten Bogor, Jawa Barat",
  logo: "/images/logo.png",
} as const;

/** 7 menu utama beranda — satu-satunya sumber kebenaran untuk beranda & navbar. */
export const MENU_UTAMA = [
  { key: "kas", label: "Transparansi Kas", href: "/kas", deskripsi: "Pemasukan, pengeluaran, dan saldo kas masjid." },
  { key: "kiblat", label: "Arah Kiblat", href: "/kiblat", deskripsi: "Kompas kiblat langsung dari HP Anda." },
  { key: "jadwal", label: "Jadwal Sholat", href: "/jadwal-sholat", deskripsi: "Waktu sholat, serta imam & khatib." },
  { key: "infaq", label: "Infaq Digital", href: "/infaq", deskripsi: "QRIS dan nomor rekening resmi DKM." },
  { key: "kegiatan", label: "Info Kegiatan", href: "/kegiatan", deskripsi: "Jadwal pengajian dan warta masjid." },
  { key: "pengurus", label: "Sejarah & Profil Pengurus", href: "/pengurus", deskripsi: "Struktur DKM masa khidmat 2024–2029." },
  { key: "saran", label: "Kotak Saran", href: "/saran", deskripsi: "Sampaikan masukan secara anonim." },
] as const;