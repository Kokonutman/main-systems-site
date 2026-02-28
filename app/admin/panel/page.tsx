import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminOverview } from "@/components/admin-overview";
import { getAdminOverview } from "@/lib/admin-overview";
import { hasAdminPasswordConfigured, isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelPage() {
  if (!hasAdminPasswordConfigured()) {
    redirect("/admin");
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin?next=/admin/panel");
  }

  const data = await getAdminOverview(false);

  return (
    <main className="mx-auto max-w-6xl px-5 pb-10 pt-4 sm:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-slate-800/70 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/systems site icon.png" alt="arjun.systems icon" width={36} height={36} className="h-9 w-9 rounded-md" />
          <div>
            <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Protected</div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Systems admin panel</h1>
          </div>
        </div>
        <Link href="/" className="text-sm text-slate-400 transition-colors hover:text-emerald-300">
          Back to hub
        </Link>
      </header>

      <AdminOverview initialData={data} />
    </main>
  );
}
