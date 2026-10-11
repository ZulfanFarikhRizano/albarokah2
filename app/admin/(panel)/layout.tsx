import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

// Semua halaman di dalam grup (panel) hanya untuk admin yang login.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect("/admin/login");

  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="flex min-h-[70vh] flex-col md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
