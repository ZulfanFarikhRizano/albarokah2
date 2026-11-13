"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// =====================================================================
//  Server Actions. Semua penulisan data lewat sini.
// =====================================================================

export type FormState = { ok: boolean; message: string } | null;
// PERBAIKAN VERCEL: Menggunakan 'any' agar lolos validasi strict <form action> di Next.js
export type ActionResult = any; 

const NOT_CONFIGURED = "Database belum tersambung. Hubungi pengurus yang mengelola website.";
const DOMAIN_ADMIN = "admin.dkm.local";

const ok = (message = "Berhasil disimpan."): ActionResult => ({ ok: true, message });
const fail = (message: string): ActionResult => ({ ok: false, message });

// ---------------------------------------------------------------- Helper validasi
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

// ---------------------------------------------------------------- Helper eksekusi
type Sb = ReturnType<typeof createClient>;
type DbRes = { error: { message: string } | null; data?: unknown };

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("row-level security") || m.includes("permission denied"))
    return "Akun ini tidak memiliki akses admin, atau sesi sudah berakhir. Silakan masuk kembali.";
  if (m.includes("jwt") || m.includes("not authenticated"))
    return "Sesi berakhir. Silakan masuk kembali.";
  if (m.includes("fetch failed") || m.includes("network"))
    return "Koneksi ke database bermasalah. Coba lagi.";
  return message;
}

// PERBAIKAN VERCEL: Return type diubah menjadi Promise<any>
async function mutate(
  job: (sb: Sb) => PromiseLike<DbRes>,
  paths: string[],
  okMessage: string
): Promise<any> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  try {
    const { error, data } = await job(createClient());
    if (error) return fail(friendly(error.message));
    if (Array.isArray(data) && data.length === 0)
      return fail("Tidak ada data yang berubah. Data sudah dihapus, atau akun ini tidak memiliki akses admin.");
    paths.forEach((p) => revalidatePath(p));
    return ok(okMessage);
  } catch (e) {
    return fail(friendly((e as Error).message || "Terjadi kesalahan. Coba lagi."));
  }
}

const P = {
  kas: ["/admin/kas", "/admin", "/kas", "/"],
  pengajian: ["/admin/pengajian", "/admin", "/kegiatan", "/"],
  warta: ["/admin/warta", "/admin", "/kegiatan", "/"],
  imam: ["/admin/imam", "/jadwal-sholat"],
  pengurus: ["/admin/pengurus", "/admin", "/pengurus"],
  saran: ["/admin/saran", "/admin"],
  zakat: ["/admin/zakat", "/zakat"],
  kurban: ["/admin/kurban", "/kurban"],
  booking: ["/admin/booking", "/admin", "/booking"],
};

// ---------------------------------------------------------------- Auth
export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED };

  const username = str(fd, "username", 40).toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!username || !password) return { ok: false, message: "Username dan password wajib diisi." };
  if (!/^[a-z0-9._-]+$/.test(username))
    return { ok: false, message: "Username hanya boleh huruf, angka, titik, strip, dan underscore." };

  const sb = createClient();
  const { error } = await sb.auth.signInWithPassword({
    email: `${username}@${DOMAIN_ADMIN}`,
    password,
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
const KATEGORI_KAS = ["Pemasukan", "Pengeluaran", "Pemasukan QRIS", "Pengeluaran QRIS"] as const;

export async function addKasAction(fd: FormData): Promise<any> {
  return mutate(
    (sb) =>
      sb.from("kas_transaksi").insert({
        tanggal: date(fd, "tanggal"),
        keterangan: reqStr(fd, "keterangan", "Keterangan", 200),
        kategori: oneOf(str(fd, "kategori"), KATEGORI_KAS, "Kategori"),
        nominal: int(fd, "nominal", "Nominal"),
      }),
    P.kas,
    "Transaksi berhasil disimpan."
  );
}
export async function deleteKasAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("kas_transaksi").delete().eq("id", id).select("id"), P.kas, "Transaksi dihapus.");
}

// ---------------------------------------------------------------- Pengajian
export async function addPengajianAction(fd: FormData): Promise<any> {
  return mutate(
    (sb) =>
      sb.from("pengajian").insert({
        judul: reqStr(fd, "judul", "Judul", 200),
        ustadz: reqStr(fd, "ustadz", "Ustadz", 120),
        tanggal: date(fd, "tanggal"),
        jam: reqStr(fd, "jam", "Jam", 10),
        tempat: reqStr(fd, "tempat", "Tempat", 120),
      }),
    P.pengajian,
    "Jadwal pengajian disimpan."
  );
}
export async function deletePengajianAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("pengajian").delete().eq("id", id).select("id"), P.pengajian, "Jadwal dihapus.");
}

// ---------------------------------------------------------------- Warta
export async function addWartaAction(fd: FormData): Promise<any> {
  return mutate(
    (sb) =>
      sb.from("warta").insert({
        jenis: oneOf(str(fd, "jenis"), ["Pengumuman", "Duka Cita"] as const, "Jenis"),
        judul: reqStr(fd, "judul", "Judul", 200),
        isi: reqStr(fd, "isi", "Isi warta", 2000),
        tanggal: date(fd, "tanggal"),
      }),
    P.warta,
    "Warta diterbitkan."
  );
}
export async function deleteWartaAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("warta").delete().eq("id", id).select("id"), P.warta, "Warta dihapus.");
}

// ---------------------------------------------------------------- Imam & khatib
export async function addJadwalImamAction(fd: FormData): Promise<any> {
  return mutate(
    (sb) =>
      sb.from("jadwal_imam").insert({
        jenis: oneOf(str(fd, "jenis"), ["Jumat", "Tarawih"] as const, "Jenis"),
        tanggal: date(fd, "tanggal"),
        imam: reqStr(fd, "imam", "Nama imam", 120),
        khatib: str(fd, "khatib", 120) || null,
        materi: str(fd, "materi", 300) || null,
      }),
    P.imam,
    "Jadwal imam disimpan."
  );
}
export async function deleteJadwalImamAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("jadwal_imam").delete().eq("id", id).select("id"), P.imam, "Jadwal dihapus.");
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
export async function addPengurusAction(fd: FormData): Promise<any> {
  return mutate((sb) => sb.from("pengurus").insert(pengurusPayload(fd)), P.pengurus, "Pengurus ditambahkan.");
}
export async function updatePengurusAction(id: string, fd: FormData): Promise<any> {
  return mutate(
    (sb) => sb.from("pengurus").update(pengurusPayload(fd)).eq("id", id).select("id"),
    P.pengurus,
    "Perubahan disimpan."
  );
}
export async function deletePengurusAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("pengurus").delete().eq("id", id).select("id"), P.pengurus, "Pengurus dihapus.");
}

// ---------------------------------------------------------------- Saran
export async function submitSaranAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED };
  const isi = str(fd, "isi", 1000);
  if (isi.length < 3) return { ok: false, message: "Saran terlalu pendek." };
  if (str(fd, "website", 50)) return { ok: true, message: "Terima kasih, saran Anda sudah kami terima." };
  const { error } = await createClient().from("saran").insert({ isi });
  if (error) return { ok: false, message: "Saran belum terkirim. Coba lagi beberapa saat lagi." };
  revalidatePath("/admin/saran");
  return { ok: true, message: "Terima kasih, saran Anda sudah kami terima." };
}
export async function updateSaranStatusAction(
  id: string,
  status: "Baru" | "Dibaca" | "Ditindaklanjuti",
  _fd?: FormData
): Promise<any> {
  return mutate(
    (sb) =>
      sb
        .from("saran")
        .update({ status: oneOf(status, ["Baru", "Dibaca", "Ditindaklanjuti"] as const, "Status") })
        .eq("id", id)
        .select("id"),
    P.saran,
    `Saran ditandai ${status}.`
  );
}
export async function deleteSaranAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("saran").delete().eq("id", id).select("id"), P.saran, "Saran dihapus.");
}

// ---------------------------------------------------------------- Zakat & kurban
export async function addZakatAction(fd: FormData): Promise<any> {
  return mutate(
    (sb) => {
      const jiwa = str(fd, "jumlahJiwa", 6);
      return sb.from("zakat_entri").insert({
        nama: reqStr(fd, "nama", "Nama muzakki", 120),
        jenis: oneOf(str(fd, "jenis"), ["Zakat Fitrah", "Zakat Maal", "Infaq BAZNAS"] as const, "Jenis"),
        jumlah_jiwa: jiwa ? int(fd, "jumlahJiwa", "Jumlah jiwa", 0) : null,
        nominal: int(fd, "nominal", "Nominal"),
        tanggal: date(fd, "tanggal"),
      });
    },
    P.zakat,
    "Data zakat disimpan."
  );
}
export async function setZakatStatusAction(
  id: string,
  status: "Belum Disetor" | "Sudah Disetor ke BAZNAS",
  _fd?: FormData
): Promise<any> {
  return mutate(
    (sb) => sb.from("zakat_entri").update({ status_setor: status }).eq("id", id).select("id"),
    P.zakat,
    "Status zakat diperbarui."
  );
}
export async function deleteZakatAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("zakat_entri").delete().eq("id", id).select("id"), P.zakat, "Data zakat dihapus.");
}

export async function addKurbanAction(fd: FormData): Promise<any> {
  return mutate(
    (sb) =>
      sb.from("kurban_entri").insert({
        nama_pengurban: reqStr(fd, "namaPengurban", "Nama pengurban", 120),
        jenis_hewan: oneOf(str(fd, "jenisHewan"), ["Sapi", "Kambing", "Domba"] as const, "Jenis hewan"),
        jumlah_hewan: int(fd, "jumlahHewan", "Jumlah ekor", 1),
        atas_nama: reqStr(fd, "atasNama", "Atas nama", 120),
      }),
    P.kurban,
    "Pendaftar kurban disimpan."
  );
}
export async function setKurbanStatusAction(
  id: string,
  status: "Terdaftar" | "Sudah Disembelih" | "Sudah Didistribusikan",
  _fd?: FormData
): Promise<any> {
  return mutate(
    (sb) => sb.from("kurban_entri").update({ status_distribusi: status }).eq("id", id).select("id"),
    P.kurban,
    `Status diperbarui: ${status}.`
  );
}
export async function deleteKurbanAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("kurban_entri").delete().eq("id", id).select("id"), P.kurban, "Pendaftar dihapus.");
}

// ---------------------------------------------------------------- Fasilitas & booking
export async function addFasilitasAction(fd: FormData): Promise<any> {
  return mutate(
    (sb) =>
      sb.from("fasilitas").insert({
        nama: reqStr(fd, "nama", "Nama fasilitas", 100),
        deskripsi: str(fd, "deskripsi", 300),
      }),
    P.booking,
    "Fasilitas ditambahkan."
  );
}
export async function deleteFasilitasAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("fasilitas").delete().eq("id", id).select("id"), P.booking, "Fasilitas dihapus.");
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
export async function updateBookingStatusAction(
  id: string,
  status: "Menunggu" | "Disetujui" | "Ditolak",
  _fd?: FormData
): Promise<any> {
  return mutate(
    (sb) => sb.from("booking").update({ status }).eq("id", id).select("id"),
    P.booking,
    `Booking ${status.toLowerCase()}.`
  );
}
export async function deleteBookingAction(id: string, _fd?: FormData): Promise<any> {
  return mutate((sb) => sb.from("booking").delete().eq("id", id).select("id"), P.booking, "Pengajuan dihapus.");
}

// ---------------------------------------------------------------- Pengaturan
function setPengaturan(sb: Sb, pairs: Record<string, string>): PromiseLike<DbRes> {
  const rows = Object.entries(pairs).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  return sb.from("pengaturan").upsert(rows, { onConflict: "key" });
}

// PERBAIKAN VERCEL: Return type diubah menjadi Promise<any>
async function mutateLayout(job: (sb: Sb) => PromiseLike<DbRes>, okMessage: string): Promise<any> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  try {
    const { error } = await job(createClient());
    if (error) return fail(friendly(error.message));
    revalidatePath("/", "layout");
    return ok(okMessage);
  } catch (e) {
    return fail(friendly((e as Error).message || "Terjadi kesalahan. Coba lagi."));
  }
}

export async function saveInfaqAction(fd: FormData): Promise<any> {
  return mutateLayout(async (sb) => {
    const pairs: Record<string, string> = {
      infaq_bank: str(fd, "bank", 40),
      infaq_rekening: str(fd, "rekening", 40),
      infaq_atas_nama: str(fd, "atasNama", 80),
      infaq_maintenance: fd.get("maintenance") === "on" ? "true" : "false",
    };

    const file = fd.get("qris");
    if (file instanceof File && file.size > 0) {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
        throw new Error("QRIS harus berupa gambar PNG, JPG, atau WebP.");
      if (file.size > 2 * 1024 * 1024) throw new Error("Ukuran gambar QRIS maksimal 2 MB.");

      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `qris/qris-${Date.now()}.${ext}`;
      const up = await sb.storage.from("masjid").upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) return { error: up.error };
      pairs.infaq_qris_url = sb.storage.from("masjid").getPublicUrl(path).data.publicUrl;
    }
    if (fd.get("hapusQris") === "on") pairs.infaq_qris_url = "";

    return setPengaturan(sb, pairs);
  }, "Pengaturan infaq disimpan.");
}

export async function setFiturMusimanAction(fitur: string, aktif: boolean, _fd?: FormData): Promise<any> {
  return mutateLayout(
    (sb) => setPengaturan(sb, { [`fitur_${fitur}_aktif`]: aktif ? "true" : "false" }),
    "Pengaturan disimpan."
  );
}

export async function saveLokasiAction(fd: FormData): Promise<any> {
  return mutateLayout((sb) => {
    const lat = Number(str(fd, "lat", 20));
    const lng = Number(str(fd, "lng", 20));
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Latitude tidak valid (-90 s.d. 90).");
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error("Longitude tidak valid (-180 s.d. 180).");
    return setPengaturan(sb, {
      masjid_lokasi: str(fd, "lokasi", 120),
      masjid_lat: String(lat),
      masjid_lng: String(lng),
    });
  }, "Lokasi masjid disimpan.");
}