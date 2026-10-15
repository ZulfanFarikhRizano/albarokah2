import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// =====================================================================
//  Lapisan data — semua dibaca dari Supabase (lihat supabase/schema.sql).
//  Tidak ada data contoh di kode: kalau tabel kosong, halaman menampilkan
//  empty state; kalau database belum tersambung, halaman menampilkan
//  pemberitahuan (bukan data palsu).
// =====================================================================

export type Result<T> = { data: T; error: string | null };

// Contoh fungsi hitung jumlah cepat tanpa over-fetching
export async function getJumlahSaranBaru() {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('saran')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Baru');
    
  return { count: count ?? 0, error };
}

export type KasTransaksi = {
  id: string;
  tanggal: string;
  keterangan: string;
  kategori: "Pemasukan" | "Pengeluaran";
  nominal: number;
};
export type Pengajian = { id: string; judul: string; ustadz: string; tanggal: string; jam: string; tempat: string };
export type WartaPost = { id: string; jenis: "Duka Cita" | "Pengumuman"; judul: string; isi: string; tanggal: string };
export type JadwalImam = {
  id: string;
  jenis: "Jumat" | "Tarawih";
  tanggal: string;
  imam: string;
  khatib: string | null;
  materi: string | null;
};
export type Pengurus = {
  id: string;
  nama: string | null;
  jabatan: string;
  seksi: string | null;
  kelompok: "penasehat" | "inti" | "seksi";
  urutan: number;
  telepon: string | null;
};
export type Saran = { id: string; isi: string; status: "Baru" | "Dibaca" | "Ditindaklanjuti"; tanggal: string };
export type ZakatEntry = {
  id: string;
  nama: string;
  jenis: "Zakat Fitrah" | "Zakat Maal" | "Infaq BAZNAS";
  jumlahJiwa: number | null;
  nominal: number;
  tanggal: string;
  statusSetor: "Belum Disetor" | "Sudah Disetor ke BAZNAS";
};
export type KurbanEntry = {
  id: string;
  namaPengurban: string;
  jenisHewan: "Sapi" | "Kambing" | "Domba";
  jumlahHewan: number;
  atasNama: string;
  statusDistribusi: "Terdaftar" | "Sudah Disembelih" | "Sudah Didistribusikan";
};
export type Fasilitas = { id: string; nama: string; deskripsi: string };
export type BookingEntry = {
  id: string;
  fasilitasId: string;
  namaPemesan: string;
  keperluan: string;
  tanggal: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
};

export type Pengaturan = {
  namaMasjid: string;
  lokasi: string;
  lat: number | null;
  lng: number | null;
  zakatAktif: boolean;
  kurbanAktif: boolean;
  bank: string;
  rekening: string;
  atasNama: string;
  qrisUrl: string;
  // Menambahkan properti infaqMaintenance
  infaqMaintenance: string;
};

const NOT_CONFIGURED =
  "Database belum tersambung. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local lalu jalankan supabase/schema.sql.";

type Row = Record<string, any>;

async function select<T>(
  build: (sb: ReturnType<typeof createClient>) => PromiseLike<{ data: Row[] | null; error: { message: string } | null }>,
  map: (r: Row) => T
): Promise<Result<T[]>> {
  if (!isSupabaseConfigured()) return { data: [], error: NOT_CONFIGURED };
  try {
    const { data, error } = await build(createClient());
    if (error) return { data: [], error: error.message };
    return { data: (data ?? []).map(map), error: null };
  } catch {
    return { data: [], error: "Tidak dapat terhubung ke database." };
  }
}

/** Tanggal hari ini (YYYY-MM-DD) menurut WIB. */
export function hariIniWIB() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
}

export const formatTanggal = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`)
  );

// ---------- Pengaturan ----------
export const getPengaturan = cache(async (): Promise<Result<Pengaturan>> => {
  const kosong: Pengaturan = {
    namaMasjid: "Masjid Jami' Al Barokah",
    lokasi: "",
    lat: null,
    lng: null,
    zakatAktif: false,
    kurbanAktif: false,
    bank: "",
    rekening: "",
    atasNama: "",
    qrisUrl: "",
    // Nilai default untuk maintenance
    infaqMaintenance: "false",
  };
  const res = await select((sb) => sb.from("pengaturan").select("key,value"), (r) => r as { key: string; value: string });
  if (res.error) return { data: kosong, error: res.error };
  const m = Object.fromEntries(res.data.map((r) => [r.key, r.value]));
  const num = (v?: string) => (v && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
  return {
    error: null,
    data: {
      namaMasjid: m.masjid_nama || kosong.namaMasjid,
      lokasi: m.masjid_lokasi ?? "",
      lat: num(m.masjid_lat),
      lng: num(m.masjid_lng),
      zakatAktif: m.fitur_zakat_aktif === "true",
      kurbanAktif: m.fitur_kurban_aktif === "true",
      bank: m.infaq_bank ?? "",
      rekening: m.infaq_rekening ?? "",
      atasNama: m.infaq_atas_nama ?? "",
      qrisUrl: m.infaq_qris_url ?? "",
      // Mengambil nilai maintenance dari database
      infaqMaintenance: m.infaq_maintenance ?? "false",
    },
  };
});

// ---------- Kas ----------
export const getKas = () =>
  select(
    (sb) =>
      sb
        .from("kas_transaksi")
        .select("id,tanggal,keterangan,kategori,nominal")
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false }),
    (r): KasTransaksi => ({ ...(r as KasTransaksi), nominal: Number(r.nominal) })
  );

export const ringkasKas = (kas: KasTransaksi[]) => {
  const masuk = kas.filter((k) => k.kategori === "Pemasukan").reduce((a, b) => a + b.nominal, 0);
  const keluar = kas.filter((k) => k.kategori === "Pengeluaran").reduce((a, b) => a + b.nominal, 0);
  return { masuk, keluar, saldo: masuk - keluar };
};

// ---------- Pengajian & warta ----------
export const getPengajian = (opts: { semua?: boolean } = {}) =>
  select(
    (sb) => {
      let q = sb.from("pengajian").select("id,judul,ustadz,tanggal,jam,tempat");
      if (!opts.semua) q = q.gte("tanggal", hariIniWIB());
      return q.order("tanggal", { ascending: !opts.semua }).order("jam", { ascending: true });
    },
    (r) => r as Pengajian
  );

export const getWarta = (limit = 50) =>
  select(
    (sb) =>
      sb
        .from("warta")
        .select("id,jenis,judul,isi,tanggal")
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit),
    (r) => r as WartaPost
  );

// ---------- Imam & khatib ----------
export const getJadwalImam = (opts: { semua?: boolean } = {}) =>
  select(
    (sb) => {
      let q = sb.from("jadwal_imam").select("id,jenis,tanggal,imam,khatib,materi");
      if (!opts.semua) q = q.gte("tanggal", hariIniWIB());
      return q.order("tanggal", { ascending: !opts.semua });
    },
    (r) => r as JadwalImam
  );

// ---------- Pengurus ----------
export const getPengurus = () =>
  select(
    (sb) =>
      sb
        .from("pengurus")
        .select("id,nama,jabatan,seksi,kelompok,urutan,telepon")
        .order("kelompok", { ascending: true })
        .order("seksi", { ascending: true })
        .order("urutan", { ascending: true }),
    (r) => r as Pengurus
  );

// ---------- Saran (admin) ----------
export const getSaran = () =>
  select(
    (sb) => sb.from("saran").select("id,isi,status,created_at").order("created_at", { ascending: false }),
    (r): Saran => ({ id: r.id, isi: r.isi, status: r.status, tanggal: String(r.created_at).slice(0, 10) })
  );

// ---------- Zakat & kurban ----------
export const getZakat = () =>
  select(
    (sb) =>
      sb
        .from("zakat_entri")
        .select("id,nama,jenis,jumlah_jiwa,nominal,tanggal,status_setor")
        .order("tanggal", { ascending: false }),
    (r): ZakatEntry => ({
      id: r.id,
      nama: r.nama,
      jenis: r.jenis,
      jumlahJiwa: r.jumlah_jiwa,
      nominal: Number(r.nominal),
      tanggal: r.tanggal,
      statusSetor: r.status_setor,
    })
  );

export const getKurban = () =>
  select(
    (sb) =>
      sb
        .from("kurban_entri")
        .select("id,nama_pengurban,jenis_hewan,jumlah_hewan,atas_nama,status_distribusi")
        .order("created_at", { ascending: false }),
    (r): KurbanEntry => ({
      id: r.id,
      namaPengurban: r.nama_pengurban,
      jenisHewan: r.jenis_hewan,
      jumlahHewan: r.jumlah_hewan,
      atasNama: r.atas_nama,
      statusDistribusi: r.status_distribusi,
    })
  );

// ---------- Fasilitas & booking ----------
export const getFasilitas = () =>
  select(
    (sb) => sb.from("fasilitas").select("id,nama,deskripsi").order("nama", { ascending: true }),
    (r) => r as Fasilitas
  );

/** Publik hanya bisa melihat booking berstatus "Disetujui" (diatur RLS); admin melihat semuanya. */
export const getBooking = () =>
  select(
    (sb) =>
      sb
        .from("booking")
        .select("id,fasilitas_id,nama_pemesan,keperluan,tanggal,status")
        .order("tanggal", { ascending: true }),
    (r): BookingEntry => ({
      id: r.id,
      fasilitasId: r.fasilitas_id,
      namaPemesan: r.nama_pemesan,
      keperluan: r.keperluan,
      tanggal: r.tanggal,
      status: r.status,
    })
  );