import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { ActionForm } from "@/components/admin/action-form";
import { SubmitButton } from "@/components/submit-button";
import { getPengurus, type Pengurus } from "@/lib/data";
import { addPengurusAction, deletePengurusAction, updatePengurusAction } from "@/lib/actions";

const LABEL_KELOMPOK = { inti: "Pengurus Inti", penasehat: "Dewan Penasehat", seksi: "Seksi" } as const;

function Fields({ p }: { p?: Pengurus }) {
  return (
    <>
      <Input name="nama" defaultValue={p?.nama ?? ""} placeholder="Nama lengkap (boleh kosong)" maxLength={120} aria-label="Nama" />
      <Input name="jabatan" defaultValue={p?.jabatan ?? ""} placeholder="Jabatan (mis. Anggota, Sekretaris)" required maxLength={80} aria-label="Jabatan" />
      <Select name="kelompok" defaultValue={p?.kelompok ?? "seksi"} aria-label="Kelompok">
        <option value="inti">Pengurus Inti</option>
        <option value="penasehat">Dewan Penasehat</option>
        <option value="seksi">Anggota Seksi</option>
      </Select>
      <Input name="seksi" list="daftar-seksi" defaultValue={p?.seksi ?? ""} placeholder="Nama seksi (khusus anggota seksi)" maxLength={80} aria-label="Seksi" />
      <Input type="number" name="urutan" defaultValue={p?.urutan ?? 0} min={0} aria-label="Urutan tampil" title="Urutan tampil" />
      <Input name="telepon" defaultValue={p?.telepon ?? ""} placeholder="Nomor telepon (opsional)" maxLength={30} aria-label="Telepon" />
    </>
  );
}

export default async function AdminPengurusPage() {
  const { data, error } = await getPengurus();
  const seksiList = [...new Set(data.map((p) => p.seksi).filter((s): s is string => !!s))];

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-primary-900">Kelola Pengurus DKM</h1>
      <p className="mb-6 text-sm text-foreground/55">Data ini tampil di halaman Sejarah &amp; Profil Pengurus. Klik baris untuk mengubah.</p>
      <DbNotice error={error} />

      {/* Satu datalist untuk semua form (dulu dirender ulang di setiap baris dengan id kembar). */}
      <datalist id="daftar-seksi">{seksiList.map((s) => <option key={s} value={s} />)}</datalist>

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground/80">Tambah Pengurus</p>
        <ActionForm action={addPengurusAction} resetOnSuccess className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Fields />
          <SubmitButton label="Simpan Pengurus" className="sm:col-span-2 lg:col-span-3" />
        </ActionForm>
      </Card>

      <Card className="overflow-hidden p-0">
        {data.length === 0 && <p className="px-4 py-8 text-center text-sm text-foreground/50">Belum ada data pengurus.</p>}
        {data.map((p) => (
          <details key={p.id} className="group border-b border-border last:border-0">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.nama ?? <span className="italic text-foreground/40">Nama belum diisi</span>}</p>
                <p className="truncate text-sm text-foreground/55">{p.jabatan}{p.seksi ? ` · ${p.seksi}` : ""}</p>
              </div>
              <Badge tone={p.kelompok === "inti" ? "green" : p.kelompok === "penasehat" ? "yellow" : "neutral"}>{LABEL_KELOMPOK[p.kelompok]}</Badge>
              <ChevronDown size={16} className="shrink-0 text-foreground/40 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-border bg-muted/30 px-4 py-4">
              <ActionForm action={updatePengurusAction.bind(null, p.id)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Fields p={p} />
                <SubmitButton label="Simpan Perubahan" className="sm:col-span-2 lg:col-span-3" />
              </ActionForm>
              <div className="mt-3 flex justify-end">
                <HapusButton action={deletePengurusAction.bind(null, p.id)} label={`Hapus ${p.nama ?? p.jabatan}`} konfirmasi={`Hapus ${p.nama ?? p.jabatan} dari daftar pengurus?`} />
              </div>
            </div>
          </details>
        ))}
      </Card>
    </div>
  );
}