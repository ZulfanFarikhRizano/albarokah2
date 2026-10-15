"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// =====================================================================
//  Server Actions. Semua penulisan data lewat sini.
//  Keamanan sebenarnya ada di Row Level Security (supabase/schema.sql):
//  aksi admin ditolak database kalau bukan admin, walau fungsi ini dipanggil.
// =====================================================================

export type FormState = { ok: boolean; message: string } | null;

const NOT_CONFIGURED = "Database belum tersambung. Hubungi pengurus yang mengelola website.";

// Username diubah jadi email internal (tidak pernah ditampilkan ke pengguna).
const DOMAIN_ADMIN = "admin.dkm.local";

function str(fd: FormData, key: string, max = 500) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}
function reqStr(fd: FormData, key: string, label: string, max = 500) {
  const v = str(fd, key, max);
  if (!v) throw new Error(`${label} wajib diisi.`);
  return v;
}
function date(fd: FormData, key: string, label = "Tanggal") {
  const v = str(fd, key, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error(`${label} tidak valid.`);
  return v;
}
function int(fd: FormData, key: string, label: string, min = 0) {
  const n = Math.trunc(Number(String(fd.get(key) ?? "").replace(/[^\d-]/g, "")));
  if (!Number.isFinite(n) || n < min) throw new Error(`${label} tidak valid.`);
  return n;
}
function oneOf<T extends string>(v: string, allowed: readonly T[], label: string): T {
  if (!(allowed as readonly string[]).includes(v)) throw new Error(`${label} tidak valid.`);
  return v as T;
}

async function admin() {
  if (!isSupabaseConfigured()) throw new Error(NOT_CONFIGURED);
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Sesi berakhir. Silakan masuk kembali.");
  const { data: ok } = await sb.rpc("is_admin");
  if (!ok) throw new Error("Akun ini tidak memiliki akses admin.");
  return sb;
}

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

const refresh = () => revalidatePath("/", "layout");

// ---------------------------------------------------------------- Auth
export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED };
  
  const username = str(fd, "username", 40).toLowerCase();
  const password = String(fd.get("password") ?? "");
  
  if (!username || !password) return { ok: false, message: "Username dan password wajib diisi." };
  if (!/^[a-z0-9._-]+$/.test(username)) return { ok: false, message: "Username hanya boleh huruf, angka, titik, strip, dan underscore." };

  const sb = createClient();
  const { error } = await sb.auth.signInWithPassword({ 
    email: `${username}@${DOMAIN_ADMIN}`, 
    password 
  });
  
  if (error) return { ok: false, message: "Username atau password salah." };

  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) {
    await sb.auth.signOut();
    return { ok: false, message: "Akun ini belum terdaftar sebagai admin DKM." };
  }
  redirect("/admin");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) await createClient().auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- Kas
export async function addKasAction(fd: FormData) {
  const sb = await admin();
  const { error } = await sb.from("kas_transaksi").insert({
    tanggal: date(fd, "tanggal"),
    keterangan: reqStr(fd, "keterangan", "Keterangan", 200),
    kategori: oneOf(str(fd, "kategori"), ["Pemasukan", "Pengeluaran"] as const, "Kategori"),
    nominal: int(fd, "nominal", "Nominal"),
  });
  check(error);
  refresh();
}
export async function deleteKasAction(id: string) {
  const sb = await admin();
  check((await sb.from("kas_transaksi").delete().eq("id", id)).error);
  refresh();
}

// ---------------------------------------------------------------- Pengajian
export async function addPengajianAction(fd: FormData) {
  const sb = await admin();
  const { error } = await sb.from("pengajian").insert({
    judul: reqStr(fd, "judul", "Judul", 200),
    ustadz: reqStr(fd, "ustadz", "Ustadz", 120),
    tanggal: date(fd, "tanggal"),
    jam: reqStr(fd, "jam", "Jam", 10),
    tempat: reqStr(fd, "tempat", "Tempat", 120),
  });
  check(error);
  refresh();
}
export async function deletePengajianAction(id: string) {
  const sb = await admin();
  check((await sb.from("pengajian").delete().eq("id", id)).error);
  refresh();
}

// ---------------------------------------------------------------- Warta
export async function addWartaAction(fd: FormData) {
  const sb = await admin();
  const { error } = await sb.from("warta").insert({
    jenis: oneOf(str(fd, "jenis"), ["Pengumuman", "Duka Cita"] as const, "Jenis"),
    judul: reqStr(fd, "judul", "Judul", 200),
    isi: reqStr(fd, "isi", "Isi warta", 2000),
    tanggal: date(fd, "tanggal"),
  });
  check(error);
  refresh();
}
export async function deleteWartaAction(id: string) {
  const sb = await admin();
  check((await sb.from("warta").delete().eq("id", id)).error);
  refresh();
}

// ---------------------------------------------------------------- Imam & khatib
export async function addJadwalImamAction(fd: FormData) {
  const sb = await admin();
  const { error } = await sb.from("jadwal_imam").insert({
    jenis: oneOf(str(fd, "jenis"), ["Jumat", "Tarawih"] as const, "Jenis"),
    tanggal: date(fd, "tanggal"),
    imam: reqStr(fd, "imam", "Nama imam", 120),
    khatib: str(fd, "khatib", 120) || null,
    materi: str(fd, "materi", 300) || null,
  });
  check(error);
  refresh();
}
export async function deleteJadwalImamAction(id: string) {
  const sb = await admin();
  check((await sb.from("jadwal_imam").delete().eq("id", id)).error);
  refresh();
}

// ---------------------------------------------------------------- Pengurus
const KELOMPOK = ["penasehat", "inti", "seksi"] as const;

function pengurusPayload(fd: FormData) {
  const kelompok = oneOf(str(fd, "kelompok"), KELOMPOK, "Kelompok");
  const seksi = str(fd, "seksi", 80);
  if (kelompok === "seksi" && !seksi) throw new Error("Nama seksi wajib diisi untuk anggota seksi.");
  return {
    nama: str(fd, "nama", 120) || null,
    jabatan: reqStr(fd, "jabatan", "Jabatan", 80),
    kelompok,
    seksi: kelompok === "seksi" ? seksi : null,
    urutan: int(fd, "urutan", "Urutan", 0),
    telepon: str(fd, "telepon", 30) || null,
  };
}
export async function addPengurusAction(fd: FormData) {
  const sb = await admin();
  check((await sb.from("pengurus").insert(pengurusPayload(fd))).error);
  refresh();
}
export async function updatePengurusAction(id: string, fd: FormData) {
  const sb = await admin();
  check((await sb.from("pengurus").update(pengurusPayload(fd)).eq("id", id)).error);
  refresh();
}
export async function deletePengurusAction(id: string) {
  const sb = await admin();
  check((await sb.from("pengurus").delete().eq("id", id)).error);
  refresh();
}

// ---------------------------------------------------------------- Saran
export async function submitSaranAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED };
  const isi = str(fd, "isi", 1000);
  if (isi.length < 3) return { ok: false, message: "Saran terlalu pendek." };
  // Honeypot sederhana: kolom tersembunyi yang tidak diisi manusia.
  if (str(fd, "website", 50)) return { ok: true, message: "Terima kasih, saran Anda sudah kami terima." };
  const { error } = await createClient().from("saran").insert({ isi });
  if (error) return { ok: false, message: "Saran belum terkirim. Coba lagi beberapa saat lagi." };
  revalidatePath("/admin/saran");
  return { ok: true, message: "Terima kasih, saran Anda sudah kami terima." };
}
export async function updateSaranStatusAction(id: string, status: "Baru" | "Dibaca" | "Ditindaklanjuti") {
  const sb = await admin();
  check((await sb.from("saran").update({ status: oneOf(status, ["Baru", "Dibaca", "Ditindaklanjuti"] as const, "Status") }).eq("id", id)).error);
  refresh();
}
export async function deleteSaranAction(id: string) {
  const sb = await admin();
  check((await sb.from("saran").delete().eq("id", id)).error);
  refresh();
}

// ---------------------------------------------------------------- Zakat & kurban
export async function addZakatAction(fd: FormData) {
  const sb = await admin();
  const jiwa = str(fd, "jumlahJiwa", 6);
  const { error } = await sb.from("zakat_entri").insert({
    nama: reqStr(fd, "nama", "Nama muzakki", 120),
    jenis: oneOf(str(fd, "jenis"), ["Zakat Fitrah", "Zakat Maal", "Infaq BAZNAS"] as const, "Jenis"),
    jumlah_jiwa: jiwa ? int(fd, "jumlahJiwa", "Jumlah jiwa", 0) : null,
    nominal: int(fd, "nominal", "Nominal"),
    tanggal: date(fd, "tanggal"),
  });
  check(error);
  refresh();
}
export async function setZakatStatusAction(id: string, status: "Belum Disetor" | "Sudah Disetor ke BAZNAS") {
  const sb = await admin();
  check((await sb.from("zakat_entri").update({ status_setor: status }).eq("id", id)).error);
  refresh();
}
export async function deleteZakatAction(id: string) {
  const sb = await admin();
  check((await sb.from("zakat_entri").delete().eq("id", id)).error);
  refresh();
}

export async function addKurbanAction(fd: FormData) {
  const sb = await admin();
  const { error } = await sb.from("kurban_entri").insert({
    nama_pengurban: reqStr(fd, "namaPengurban", "Nama pengurban", 120),
    jenis_hewan: oneOf(str(fd, "jenisHewan"), ["Sapi", "Kambing", "Domba"] as const, "Jenis hewan"),
    jumlah_hewan: int(fd, "jumlahHewan", "Jumlah ekor", 1),
    atas_nama: reqStr(fd, "atasNama", "Atas nama", 120),
  });
  check(error);
  refresh();
}
export async function setKurbanStatusAction(id: string, status: "Terdaftar" | "Sudah Disembelih" | "Sudah Didistribusikan") {
  const sb = await admin();
  check((await sb.from("kurban_entri").update({ status_distribusi: status }).eq("id", id)).error);
  refresh();
}
export async function deleteKurbanAction(id: string) {
  const sb = await admin();
  check((await sb.from("kurban_entri").delete().eq("id", id)).error);
  refresh();
}

// ---------------------------------------------------------------- Fasilitas & booking
export async function addFasilitasAction(fd: FormData) {
  const sb = await admin();
  check(
    (await sb.from("fasilitas").insert({
      nama: reqStr(fd, "nama", "Nama fasilitas", 100),
      deskripsi: str(fd, "deskripsi", 300),
    })).error
  );
  refresh();
}
export async function deleteFasilitasAction(id: string) {
  const sb = await admin();
  check((await sb.from("fasilitas").delete().eq("id", id)).error);
  refresh();
}

export async function submitBookingAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED };
  try {
    const { error } = await createClient()
      .from("booking")
      .insert({
        fasilitas_id: reqStr(fd, "fasilitasId", "Fasilitas", 60),
        nama_pemesan: reqStr(fd, "namaPemesan", "Nama pemesan", 120),
        keperluan: reqStr(fd, "keperluan", "Keperluan", 300),
        tanggal: date(fd, "tanggal"),
      });
    if (error) return { ok: false, message: "Pengajuan belum terkirim. Coba lagi beberapa saat lagi." };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  revalidatePath("/admin/booking");
  return { ok: true, message: "Pengajuan terkirim. Pengurus akan menindaklanjuti." };
}
export async function updateBookingStatusAction(id: string, status: "Menunggu" | "Disetujui" | "Ditolak") {
  const sb = await admin();
  check((await sb.from("booking").update({ status }).eq("id", id)).error);
  refresh();
}
export async function deleteBookingAction(id: string) {
  const sb = await admin();
  check((await sb.from("booking").delete().eq("id", id)).error);
  refresh();
}

// ---------------------------------------------------------------- Pengaturan
async function setPengaturan(sb: Awaited<ReturnType<typeof admin>>, pairs: Record<string, string>) {
  const rows = Object.entries(pairs).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  check((await sb.from("pengaturan").upsert(rows, { onConflict: "key" })).error);
}

export async function saveInfaqAction(fd: FormData) {
  const sb = await admin();
  const pairs: Record<string, string> = {
    infaq_bank: str(fd, "bank", 40),
    infaq_rekening: str(fd, "rekening", 40),
    infaq_atas_nama: str(fd, "atasNama", 80),
    
    // INI ADALAH PENAMBAHAN FITUR MAINTENANCE
    infaq_maintenance: fd.get("maintenance") === "on" ? "true" : "false",
  };

  const file = fd.get("qris");
  if (file instanceof File && file.size > 0) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("QRIS harus berupa gambar PNG, JPG, atau WebP.");
    if (file.size > 2 * 1024 * 1024) throw new Error("Ukuran gambar QRIS maksimal 2 MB.");
    
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `qris/qris-${Date.now()}.${ext}`;
    const up = await sb.storage.from("masjid").upload(path, file, { contentType: file.type, upsert: false });
    check(up.error);
    pairs.infaq_qris_url = sb.storage.from("masjid").getPublicUrl(path).data.publicUrl;
  }
  if (fd.get("hapusQris") === "on") pairs.infaq_qris_url = "";

  await setPengaturan(sb, pairs);
  refresh();
}

export async function setFiturMusimanAction(fitur: "zakat" | "kurban", aktif: boolean) {
  const sb = await admin();
  await setPengaturan(sb, { [`fitur_${fitur}_aktif`]: aktif ? "true" : "false" });
  refresh();
}

export async function saveLokasiAction(fd: FormData) {
  const sb = await admin();
  const lat = Number(str(fd, "lat", 20));
  const lng = Number(str(fd, "lng", 20));
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Latitude tidak valid (-90 s.d. 90).");
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error("Longitude tidak valid (-180 s.d. 180).");
  await setPengaturan(sb, {
    masjid_lokasi: str(fd, "lokasi", 120),
    masjid_lat: String(lat),
    masjid_lng: String(lng),
  });
  refresh();
}