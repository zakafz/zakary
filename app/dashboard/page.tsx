import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already gates this, but guard here too for safety.
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl italic">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <DashboardTabs />
    </main>
  );
}
