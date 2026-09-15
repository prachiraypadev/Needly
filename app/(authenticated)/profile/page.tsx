import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile/profile-view";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import type { Database } from "@/lib/types/database.types";

export const metadata: Metadata = {
  title: "My Profile — Needly",
  description: "View and manage your Needly profile.",
};

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function ProfilePage() {
  // Authoritative session check — redirects if unauthenticated
  const { userId } = await verifySession();

  // Fetch the user's profile — RLS ensures only own row is returned
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>();

  if (error || !profile) {
    // Profile row should exist due to the trigger; if not, show a graceful state
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center">
          <p className="text-sm text-[var(--color-neutral-500)]">
            Your profile is being set up. Please refresh the page in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-neutral-900)]">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Profile display */}
      <ProfileView profile={profile} />

      {/* Edit form */}
      <div className="mt-8">
        <ProfileEditForm profile={profile} />
      </div>
    </div>
  );
}
