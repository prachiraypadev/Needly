import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import {
  getCommunityWithMembership,
  getCommunityMembers,
} from "@/lib/community/dal";
import { CommunityHeader } from "@/components/community/community-header";
import { InviteShareCard } from "@/components/community/invite-share-card";
import { MemberList } from "@/components/community/member-list";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, PlusCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: CommunityDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Community Dashboard — Needly",
    description: `Manage community ${id} and access member listings and requests.`,
  };
}

export default async function CommunityDetailPage({
  params,
}: CommunityDetailPageProps) {
  const { id: communityId } = await params;
  const { userId } = await verifySession();

  // Authoritative server-side check: Fetch community & verify caller's membership
  const detail = await getCommunityWithMembership(communityId, userId);

  if (!detail) {
    // If community does not exist or user is not an active member
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(45,90%,90%)] text-[hsl(45,90%,30%)] mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
          Community Access Restricted
        </h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)] max-w-md mx-auto">
          You must be an invited, active member of this community to access its dashboard and listings.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/communities">My Communities</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/join-community">Join via Invite Code</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { community, userRole, memberCount } = detail;
  const members = await getCommunityMembers(communityId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Communities
        </Link>
      </div>

      {/* Community Header Card */}
      <CommunityHeader
        community={community}
        userRole={userRole}
        memberCount={memberCount}
      />

      {/* Quick Action Placeholders for future phases */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-neutral-900)]">
                Community Marketplace
              </h2>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Borrow, rent, or buy items within {community.name}
              </p>
            </div>
          </div>
          <span
            aria-disabled="true"
            className="text-xs font-medium text-[var(--color-neutral-400)] cursor-not-allowed"
          >
            Coming in Phase 5
          </span>
        </div>

        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-neutral-900)]">
                Post a Need
              </h2>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Ask neighbors for tools, emergency help, or items
              </p>
            </div>
          </div>
          <span
            aria-disabled="true"
            className="text-xs font-medium text-[var(--color-neutral-400)] cursor-not-allowed"
          >
            Coming in Phase 5
          </span>
        </div>
      </div>

      {/* Invite Sharing Card (For active members) */}
      <InviteShareCard
        inviteCode={community.invite_code}
        communityName={community.name}
      />

      {/* Member Directory */}
      <MemberList members={members} />
    </div>
  );
}
