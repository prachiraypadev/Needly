import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/settings-view";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Account Settings — Jod",
  description: "Manage notification preferences, privacy boundaries, and account settings on Jod.",
};

export default async function SettingsPage() {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Profile
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Manage your notifications, community privacy, and preferences.
        </p>
      </div>

      {/* Settings Form */}
      <SettingsView
        displayName={profile?.display_name || "User"}
        email={user?.email}
      />
    </div>
  );
}
