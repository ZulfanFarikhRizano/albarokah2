import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Masjid Jami' Al Barokah",
    short_name: "Al Barokah",
    description: "Layanan Digital & Informasi Jamaah Masjid Jami' Al Barokah",
    start_url: '/',
    display: 'standalone',
    background_color: '#0a100d',
    theme_color: '#15803d',
    icons: [
      {
        src: '/images/logo2.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/logo2.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}