import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { FormPublik, SubmitButton } from "@/components/pesan-form";
import { submitSaranAction } from "@/lib/actions";

export const metadata = { title: "Kotak Saran — DKM Masjid Jami' Al Barokah" };

export default function SaranPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <PageHeader
        title="Kotak Saran"
        description="Sampaikan aspirasi Anda secara anonim. Masukan Anda langsung diterima pengurus DKM."
      />
      <Card className="p-5">
        <FormPublik action={submitSaranAction}>
          <div>
            <label htmlFor="isi" className="mb-1.5 block text-sm font-semibold text-foreground/80">
              Saran / aspirasi
            </label>
            <Textarea id="isi" name="isi" rows={5} required minLength={3} maxLength={1000} placeholder="Tuliskan saran Anda di sini…" />
          </div>
          {/* Honeypot anti-spam: disembunyikan dari manusia */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <p className="text-xs text-foreground/45">
            Identitas Anda tidak diminta dan tidak disimpan — saran ini bersifat anonim.
          </p>
          <SubmitButton>Kirim Saran</SubmitButton>
        </FormPublik>
      </Card>
    </div>
  );
}
