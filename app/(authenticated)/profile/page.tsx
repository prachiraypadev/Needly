import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { getUserCommunities } from "@/lib/community/dal";
import { ProfileView } from "@/components/profile/profile-view";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, KeyRound, Plus, ArrowRight } from "lucide-react";
import type { Database } from "@/lib/types/database.types";

export const metadata: Metadata = {
  title: "My Profile — Jod",
  description: "View and manage your Jod profile.",
};

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function ProfilePage() {
  // Authoritative session check — redirects if unauthenticated
  const { userId } = await verifySession();

  // Fetch the user's profile, communities, and activity stats in parallel
  const supabase = await createClient();
  const [
    { data: profile, error },
    communities,
    { count: needsCount },
    { count: listingsCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single<Profile>(),
    getUserCommunities(userId),
    supabase
      .from("needs")
      .select("id", { count: "exact", head: true })
      .eq("requester_id", userId),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId),
  ]);

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
          Manage your personal information, communities, and account details.
        </p>
      </div>

      {/* Profile display with stats and communities */}
      <ProfileView
        profile={profile}
        communities={communities}
        stats={{
          needsCount: needsCount ?? 0,
          listingsCount: listingsCount ?? 0,
        }}
      />

      {/* If user has not joined any community yet, show clear onboarding action */}
      {communities.length === 0 && (
        <div className="mt-6 rounded-2xl border border-[var(--color-primary-200)] bg-gradient-to-r from-[var(--color-primary-50)] to-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-600)] text-white shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-[var(--color-primary-100)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-800)]">
                  Next Step
                </span>
                <h3 className="mt-1 text-base font-bold text-[var(--color-neutral-900)]">
                  Join Your First Community
                </h3>
                <p className="mt-1 text-xs text-[var(--color-neutral-600)] leading-relaxed max-w-md">
                  Jod is community-first. Join your apartment society, hostel, or neighborhood to see shared tools, services, and neighbor requests.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button asChild variant="outline" size="sm" className="bg-white">
                <Link href="/join-community" className="flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" />
                  Enter Invite Code
                </Link>
              </Button>
              <Button asChild variant="primary" size="sm" className="shadow-xs font-bold">
                <Link href="/create-community" className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Create Society
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="mt-8">
        <ProfileEditForm profile={profile} />
      </div>
    </div>
  );
}
