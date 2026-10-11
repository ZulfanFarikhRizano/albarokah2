-- =====================================================================
--  DKM Masjid Jami' Al Barokah — skema database Supabase
--  Jalankan SELURUH file ini sekali di: Supabase Dashboard > SQL Editor.
--  Aman dijalankan ulang (idempotent): tabel/policy yang sudah ada
--  tidak akan menimpa data.
-- =====================================================================

-- ---------- 1. Admin ----------
-- Hanya user yang ada di tabel ini yang boleh mengubah data.
-- (Penting: jangan cuma mengandalkan "authenticated", karena siapa pun
--  bisa mendaftar kalau fitur Sign Up Supabase Auth belum dimatikan.)
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- 2. Pengaturan (key-value) ----------
create table if not exists public.pengaturan (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- Hanya nilai bawaan teknis. Rekening/QRIS sengaja TIDAK diisi di sini:
-- isi lewat Panel Admin > Infaq.
insert into public.pengaturan (key, value) values
  ('masjid_nama',   'Masjid Jami'' Al Barokah'),
  ('masjid_lokasi', 'Tajur Halang, Kabupaten Bogor'),
  ('masjid_lat',    '-6.595038'),
  ('masjid_lng',    '106.816635'),
  ('fitur_zakat_aktif',  'false'),
  ('fitur_kurban_aktif', 'false')
on conflict (key) do nothing;

-- ---------- 3. Kas ----------
create table if not exists public.kas_transaksi (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  keterangan text not null check (char_length(keterangan) between 1 and 200),
  kategori text not null check (kategori in ('Pemasukan', 'Pengeluaran')),
  nominal bigint not null check (nominal >= 0),
  created_at timestamptz not null default now()
);
create index if not exists kas_transaksi_tanggal_idx on public.kas_transaksi (tanggal desc);

-- ---------- 4. Info kegiatan: pengajian & warta ----------
create table if not exists public.pengajian (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  ustadz text not null,
  tanggal date not null,
  jam text not null,
  tempat text not null,
  created_at timestamptz not null default now()
);
create index if not exists pengajian_tanggal_idx on public.pengajian (tanggal);

create table if not exists public.warta (
  id uuid primary key default gen_random_uuid(),
  jenis text not null check (jenis in ('Duka Cita', 'Pengumuman')),
  judul text not null,
  isi text not null,
  tanggal date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists warta_tanggal_idx on public.warta (tanggal desc);

-- ---------- 5. Imam & khatib ----------
create table if not exists public.jadwal_imam (
  id uuid primary key default gen_random_uuid(),
  jenis text not null check (jenis in ('Jumat', 'Tarawih')),
  tanggal date not null,
  imam text not null,
  khatib text,
  materi text,
  created_at timestamptz not null default now()
);
create index if not exists jadwal_imam_tanggal_idx on public.jadwal_imam (tanggal);

-- ---------- 6. Pengurus DKM ----------
create table if not exists public.pengurus (
  id uuid primary key default gen_random_uuid(),
  nama text,                         -- boleh kosong (mis. Ketua RT yang namanya belum diisi)
  jabatan text not null,
  seksi text,                        -- diisi hanya untuk kelompok 'seksi'
  kelompok text not null check (kelompok in ('penasehat', 'inti', 'seksi')),
  urutan int not null default 0,
  telepon text,
  created_at timestamptz not null default now()
);
create index if not exists pengurus_urut_idx on public.pengurus (kelompok, seksi, urutan);

-- ---------- 7. Kotak saran ----------
create table if not exists public.saran (
  id uuid primary key default gen_random_uuid(),
  isi text not null check (char_length(isi) between 3 and 1000),
  status text not null default 'Baru' check (status in ('Baru', 'Dibaca', 'Ditindaklanjuti')),
  created_at timestamptz not null default now()
);

-- ---------- 8. Fitur musiman: zakat & kurban ----------
create table if not exists public.zakat_entri (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  jenis text not null check (jenis in ('Zakat Fitrah', 'Zakat Maal', 'Infaq BAZNAS')),
  jumlah_jiwa int,
  nominal bigint not null check (nominal >= 0),
  tanggal date not null,
  status_setor text not null default 'Belum Disetor'
    check (status_setor in ('Belum Disetor', 'Sudah Disetor ke BAZNAS')),
  created_at timestamptz not null default now()
);

create table if not exists public.kurban_entri (
  id uuid primary key default gen_random_uuid(),
  nama_pengurban text not null,
  jenis_hewan text not null check (jenis_hewan in ('Sapi', 'Kambing', 'Domba')),
  jumlah_hewan int not null default 1 check (jumlah_hewan > 0),
  atas_nama text not null,
  status_distribusi text not null default 'Terdaftar'
    check (status_distribusi in ('Terdaftar', 'Sudah Disembelih', 'Sudah Didistribusikan')),
  created_at timestamptz not null default now()
);

-- ---------- 9. Fasilitas & booking (link di footer) ----------
create table if not exists public.fasilitas (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  deskripsi text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.booking (
  id uuid primary key default gen_random_uuid(),
  fasilitas_id uuid not null references public.fasilitas (id) on delete cascade,
  nama_pemesan text not null,
  keperluan text not null,
  tanggal date not null,
  status text not null default 'Menunggu' check (status in ('Menunggu', 'Disetujui', 'Ditolak')),
  created_at timestamptz not null default now()
);
create index if not exists booking_tanggal_idx on public.booking (tanggal);

-- =====================================================================
--  Row Level Security
-- =====================================================================
alter table public.admins          enable row level security;
alter table public.pengaturan      enable row level security;
alter table public.kas_transaksi   enable row level security;
alter table public.pengajian       enable row level security;
alter table public.warta           enable row level security;
alter table public.jadwal_imam     enable row level security;
alter table public.pengurus        enable row level security;
alter table public.saran           enable row level security;
alter table public.zakat_entri     enable row level security;
alter table public.kurban_entri    enable row level security;
alter table public.fasilitas       enable row level security;
alter table public.booking         enable row level security;

-- admins: user hanya boleh melihat barisnya sendiri (tidak ada policy tulis;
-- tambah admin lewat SQL Editor, lihat bagian akhir file ini).
drop policy if exists "admins_baca_diri_sendiri" on public.admins;
create policy "admins_baca_diri_sendiri" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Tabel yang dibaca publik & dikelola admin
do $$
declare t text;
begin
  foreach t in array array[
    'pengaturan', 'kas_transaksi', 'pengajian', 'warta', 'jadwal_imam',
    'pengurus', 'zakat_entri', 'kurban_entri', 'fasilitas'
  ] loop
    execute format('drop policy if exists "%1$s_publik_baca" on public.%1$I', t);
    execute format(
      'create policy "%1$s_publik_baca" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "%1$s_admin_kelola" on public.%1$I', t);
    execute format(
      'create policy "%1$s_admin_kelola" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- saran: siapa pun boleh MENGIRIM (anonim), hanya admin yang boleh membaca/mengelola
drop policy if exists "saran_publik_kirim" on public.saran;
create policy "saran_publik_kirim" on public.saran
  for insert to anon, authenticated
  with check (status = 'Baru' and char_length(isi) between 3 and 1000);

drop policy if exists "saran_admin_kelola" on public.saran;
create policy "saran_admin_kelola" on public.saran
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- booking: publik boleh mengajukan & hanya melihat yang sudah disetujui
-- (data pemohon yang masih menunggu/ditolak tidak terlihat publik)
drop policy if exists "booking_publik_ajukan" on public.booking;
create policy "booking_publik_ajukan" on public.booking
  for insert to anon, authenticated with check (status = 'Menunggu');

drop policy if exists "booking_publik_baca_disetujui" on public.booking;
create policy "booking_publik_baca_disetujui" on public.booking
  for select to anon, authenticated using (status = 'Disetujui');

drop policy if exists "booking_admin_kelola" on public.booking;
create policy "booking_admin_kelola" on public.booking
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
--  Storage: bucket publik "masjid" (untuk gambar QRIS)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('masjid', 'masjid', true)
on conflict (id) do nothing;

drop policy if exists "masjid_publik_baca" on storage.objects;
create policy "masjid_publik_baca" on storage.objects
  for select to anon, authenticated using (bucket_id = 'masjid');

drop policy if exists "masjid_admin_tulis" on storage.objects;
create policy "masjid_admin_tulis" on storage.objects
  for all to authenticated
  using (bucket_id = 'masjid' and public.is_admin())
  with check (bucket_id = 'masjid' and public.is_admin());

-- =====================================================================
--  Data awal: Struktur Organisasi DKM Masjid Jami' Al Barokah
--  Masa Khidmat 2024 - 2029 (sesuai bagan struktur organisasi resmi).
--  Nama Ketua RW/RT belum tercantum di bagan, jadi dibiarkan kosong
--  dan bisa diisi dari Panel Admin > Pengurus.
-- =====================================================================
insert into public.pengurus (nama, jabatan, seksi, kelompok, urutan)
select v.nama, v.jabatan, v.seksi, v.kelompok, v.urutan
from (values
  -- Dewan Penasehat
  ('Drs. H. Dadang Suntana, MPD', 'Dewan Penasehat', null, 'penasehat', 1),
  (null, 'Ketua RW 05',  null, 'penasehat', 2),
  (null, 'Ketua RT 04',  null, 'penasehat', 3),
  (null, 'Ketua RT 05',  null, 'penasehat', 4),
  (null, 'Ketua RT 08',  null, 'penasehat', 5),
  (null, 'Ketua RT 017', null, 'penasehat', 6),
  (null, 'Ketua RT 018', null, 'penasehat', 7),
  (null, 'Ketua RT 019', null, 'penasehat', 8),
  -- Pengurus inti
  ('Suganda',        'Ketua DKM', null, 'inti', 1),
  ('Ferry Yoko',     'Sekretaris', null, 'inti', 2),
  ('Abdul Hasan',    'Bendahara', null, 'inti', 3),
  ('Budiyanto',      'Bendahara', null, 'inti', 4),
  -- Seksi Sosial
  ('Abdul Muid',  'Anggota', 'Seksi Sosial', 'seksi', 1),
  ('Novianto',    'Anggota', 'Seksi Sosial', 'seksi', 2),
  -- Seksi Keamanan
  ('Muamin',      'Anggota', 'Seksi Keamanan', 'seksi', 1),
  ('Bambang N',   'Anggota', 'Seksi Keamanan', 'seksi', 2),
  ('Sumarsono',   'Anggota', 'Seksi Keamanan', 'seksi', 3),
  -- Seksi Dakwah
  ('Suwarno, SH', 'Anggota', 'Seksi Dakwah', 'seksi', 1),
  ('Rutno',       'Anggota', 'Seksi Dakwah', 'seksi', 2),
  -- Seksi Majelis Ta'lim
  ('Karsinah',    'Anggota', 'Seksi Majelis Ta''lim', 'seksi', 1),
  -- Seksi Umum
  ('Nyoto Wibowo','Anggota', 'Seksi Umum', 'seksi', 1),
  ('Kamidi',      'Anggota', 'Seksi Umum', 'seksi', 2),
  ('Ismail',      'Anggota', 'Seksi Umum', 'seksi', 3),
  ('Sumardiono',  'Anggota', 'Seksi Umum', 'seksi', 4),
  ('Sumiran',     'Anggota', 'Seksi Umum', 'seksi', 5),
  ('Abdul Karim', 'Anggota', 'Seksi Umum', 'seksi', 6),
  -- Seksi Sarana & Prasarana
  ('Kasiran',     'Anggota', 'Seksi Sarana & Prasarana', 'seksi', 1),
  ('Deni',        'Anggota', 'Seksi Sarana & Prasarana', 'seksi', 2),
  ('Nana Trisna', 'Anggota', 'Seksi Sarana & Prasarana', 'seksi', 3),
  ('Tumin',       'Anggota', 'Seksi Sarana & Prasarana', 'seksi', 4),
  ('Umar',        'Anggota', 'Seksi Sarana & Prasarana', 'seksi', 5),
  -- Seksi Marbot
  ('Tarmizi',     'Anggota', 'Seksi Marbot', 'seksi', 1),
  ('Sukara',      'Anggota', 'Seksi Marbot', 'seksi', 2),
  -- Seksi Pendidikan & TPA
  ('Arif Priyanto, S.Pd.', 'Anggota', 'Seksi Pendidikan & TPA', 'seksi', 1),
  ('Yunita',       'Anggota', 'Seksi Pendidikan & TPA', 'seksi', 2),
  ('Siti Astuti',  'Anggota', 'Seksi Pendidikan & TPA', 'seksi', 3),
  ('Siti Badriyah','Anggota', 'Seksi Pendidikan & TPA', 'seksi', 4),
  ('Siti Qoriah',  'Anggota', 'Seksi Pendidikan & TPA', 'seksi', 5),
  ('Yuyun',        'Anggota', 'Seksi Pendidikan & TPA', 'seksi', 6)
) as v(nama, jabatan, seksi, kelompok, urutan)
where not exists (select 1 from public.pengurus);   -- hanya jika tabel masih kosong

-- =====================================================================
--  LANGKAH TERAKHIR (manual, sekali saja)
--  1. Supabase Dashboard > Authentication > Users > Add user
--     (isi email + password pengurus yang akan jadi admin).
--  2. Authentication > Sign In / Providers > matikan "Allow new users
--     to sign up" agar orang luar tidak bisa mendaftar.
--  3. Jalankan baris ini (ganti emailnya) untuk menjadikannya admin:
--
--     insert into public.admins (user_id)
--     select id from auth.users where email = 'email-admin@contoh.com'
--     on conflict do nothing;
-- =====================================================================
