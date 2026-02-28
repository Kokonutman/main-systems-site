import Image from "next/image";
import { AdminLoginForm } from "@/components/admin-login-form";
import { hasAdminPasswordConfigured } from "@/lib/admin-auth";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function AdminEntryPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/admin/panel";

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-10 sm:px-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Image src="/systems site icon.png" alt="arjun.systems icon" width={44} height={44} className="h-11 w-11 rounded-md" />
        <AdminLoginForm nextPath={nextPath} passwordConfigured={hasAdminPasswordConfigured()} error={params.error} />
      </div>
    </main>
  );
}
