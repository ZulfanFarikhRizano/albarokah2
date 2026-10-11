# DKM Masjid Jami' Al Barokah — Website

Next.js 14 (App Router) + TypeScript + Tailwind CSS + **Supabase** (Postgres, Auth, Storage).
Beranda minimalis dengan 7 menu utama, panel admin, dan tidak ada data contoh di kode.

## Menu

**Beranda (7 menu):** Transparansi Kas · Arah Kiblat · Jadwal Sholat (+ Imam & Khatib) ·
Infaq Digital · Info Kegiatan (Pengajian + Warta) · Sejarah & Profil Pengurus · Kotak Saran.

**Footer:** Booking Fasilitas. **Musiman (disembunyikan):** Zakat & BAZNAS, Data Kurban —
dinyalakan dari Admin → Pengaturan, lalu otomatis muncul di beranda & footer.

Rute lama `/pengajian`, `/warta`, `/imam` otomatis dialihkan ke menu baru.

## Pasang (sekali saja)

1. **Buat proyek** di https://supabase.com.
2. **Database:** Dashboard → *SQL Editor* → tempel seluruh isi `supabase/schema.sql` → *Run*.
   Ini membuat semua tabel, keamanan (RLS), bucket gambar, dan mengisi **struktur pengurus
   2024–2029** sesuai bagan organisasi. File aman dijalankan ulang.
3. **Akun admin:** *Authentication → Users → Add user* (email + password).
   Lalu *Authentication → Sign In / Providers* → matikan **Allow new users to sign up**.
   Jalankan di SQL Editor (ganti emailnya):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-admin@contoh.com'
   on conflict do nothing;
   ```
4. **Environment:** salin `.env.example` → `.env.local`, isi dari *Project Settings → API*
   (`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Di Vercel isi di
   *Settings → Environment Variables*.
5. **Logo:** taruh `logo.png` di `public/images/logo.png`.
6. Jalankan:
   ```bash
   npm install
   npm run dev      # http://localhost:3000   (admin: /admin)
   ```

## Isi data pertama kali (Panel Admin)

- **Pengurus** → lengkapi nama Ketua RW/RT (di bagan belum tertulis) dan nomor telepon bila perlu.
- **Infaq** → isi bank, nomor rekening, atas nama, dan unggah gambar QRIS resmi.
- **Pengaturan → Lokasi Masjid** → isi koordinat masjid yang tepat (dipakai jadwal sholat & kiblat).
  Nilai awal hanya titik pusat Bogor — **ganti** dengan koordinat masjid dari Google Maps.
- **Kas, Pengajian, Warta, Imam & Khatib, Fasilitas** → mulai dicatat; sebelum ada data, halaman
  publik menampilkan keterangan "belum ada data".

## Keamanan

- Semua tabel memakai Row Level Security. Publik hanya **membaca** (dan hanya **mengirim** saran &
  pengajuan booking). Menulis/mengubah/menghapus hanya untuk user yang ada di tabel `admins`,
  dicek langsung oleh database — bukan hanya oleh tampilan.
- Saran bersifat anonim; hanya admin yang bisa membacanya. Pengajuan booking baru tidak tampil ke
  publik sampai disetujui.
- Jangan pernah memakai *service_role key* di proyek ini; cukup anon key.

## Struktur singkat

```
app/                 halaman publik (page.tsx = beranda) dan app/admin/(panel) = panel admin
components/          UI (struktur-organisasi.tsx = tabel pengurus, prayer-card, infaq-panel, ...)
lib/data.ts          semua query baca ke Supabase
lib/actions.ts       semua Server Action tulis (validasi + cek admin)
lib/site.ts          nama masjid, alamat, dan daftar 7 menu utama
lib/sejarah.ts       sejarah kepemimpinan Ketua DKM
supabase/schema.sql  skema, RLS, storage, dan data awal pengurus
```
