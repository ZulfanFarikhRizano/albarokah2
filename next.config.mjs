/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Halaman lama yang sudah digabung ke menu baru
    return [
      { source: "/pengajian", destination: "/kegiatan#pengajian", permanent: true },
      { source: "/warta", destination: "/kegiatan#warta", permanent: true },
      { source: "/imam", destination: "/jadwal-sholat", permanent: true },
    ];
  },
};

export default nextConfig;
