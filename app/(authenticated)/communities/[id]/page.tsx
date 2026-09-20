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
import { ArrowLeft, ShoppingBag, PlusCircle, AlertTriangle, Package, ArrowRight } from "lucide-react";
import { DeleteCommunityButton } from "@/components/community/delete-community-button";
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
    title: "Community Dashboard — Jod",
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

      {/* Quick Community Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Action 1: Needs Feed */}
        <Link
          href={`/needs?community=${community.id}`}
          className="group rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs transition-all hover:border-[var(--color-primary-400)] hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] group-hover:bg-[var(--color-primary-100)] transition-colors">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors">
                Needs Feed
              </h3>
              <p className="mt-1 text-xs text-[var(--color-neutral-500)] leading-relaxed">
                See what members in {community.name} are requesting right now.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-600)] group-hover:translate-x-1 transition-transform">
            <span>Explore Needs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* Action 2: Post a Need */}
        <Link
          href={`/needs/create?community=${community.id}`}
          className="group rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs transition-all hover:border-[var(--color-primary-400)] hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-neutral-900)] group-hover:text-emerald-700 transition-colors">
                Ask / Post a Need
              </h3>
              <p className="mt-1 text-xs text-[var(--color-neutral-500)] leading-relaxed">
                Need a drill, ladder, projector, or help? Ask your group.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>+ Post a Request</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* Action 3: Offer Item / Service */}
        <Link
          href={`/listings/create?community=${community.id}`}
          className="group rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs transition-all hover:border-[var(--color-primary-400)] hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-neutral-900)] group-hover:text-blue-700 transition-colors">
                Offer Item / Service
              </h3>
              <p className="mt-1 text-xs text-[var(--color-neutral-500)] leading-relaxed">
                Lend extra tools, share appliances, or offer skills.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>+ Share Something</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      {/* Invite Sharing Card (For active members) */}
      <InviteShareCard
        inviteCode={community.invite_code}
        communityName={community.name}
      />

      {/* Member Directory */}
      <MemberList members={members} />

      {/* Admin / Danger Zone */}
      {(userRole === "owner" || userRole === "admin") && (
        <div className="rounded-xl border border-red-200 bg-red-50/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-900">
              Community Administration
            </h3>
            <p className="mt-1 text-xs text-red-600 max-w-md">
              Need to remove this community? Archiving will hide it from listings and remove all member associations.
            </p>
          </div>

          <DeleteCommunityButton
            communityId={community.id}
            communityName={community.name}
            variant="full"
            redirectAfter={true}
          />
        </div>
      )}
    </div>
  );
}
