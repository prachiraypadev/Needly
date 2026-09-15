import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getUserCommunities } from "@/lib/community/dal";
import {
  resolveActiveCommunity,
  getCommunityNeedsFeed,
  getUserNeeds,
} from "@/lib/needs/dal";
import { NeedCard } from "@/components/needs/need-card";
import { Button } from "@/components/ui/button";
import {
  NEED_TYPES,
  NEED_TYPE_CONFIG,
  type NeedType,
} from "@/lib/validations/need";
import Link from "next/link";
import {
  Plus,
  Building2,
  ShoppingBag,
  User,
  Inbox,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Needs Feed — Needly",
  description: "Browse needs, requests, and borrow requests in your local community.",
};

interface NeedsFeedPageProps {
  searchParams: Promise<{
    community?: string;
    type?: string;
    view?: string; // 'community' | 'my-needs'
  }>;
}

export default async function NeedsFeedPage({
  searchParams,
}: NeedsFeedPageProps) {
  const { userId } = await verifySession();
  const { community: communityParam, type: typeParam, view: viewParam } =
    await searchParams;

  // 1. Fetch user's joined communities
  const userCommunities = await getUserCommunities(userId);

  // If user is not part of any community
  if (userCommunities.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
          Join a Community to See Needs
        </h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)] max-w-md mx-auto">
          Needly connects you to verified neighbors in your apartment, hostel, or neighborhood. Join an existing community or start your own to see what neighbors need.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/join-community">Join via Invite Code</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/create-community">Create a Community</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Resolve Active Community (Strictly Server-Side Verified)
  const activeCommunity = await resolveActiveCommunity(
    userId,
    communityParam
  );

  const isMyNeedsView = viewParam === "my-needs";
  const selectedType = NEED_TYPES.includes(typeParam as NeedType)
    ? (typeParam as NeedType)
    : undefined;

  // 3. Fetch Needs based on active community scope
  const needs = isMyNeedsView
    ? await getUserNeeds(userId)
    : activeCommunity
    ? await getCommunityNeedsFeed(activeCommunity.id, userId, selectedType)
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Community Needs
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            See what neighbors are looking for, or ask for something you need.
          </p>
        </div>

        {/* Action Button */}
        <Button asChild variant="primary" size="sm" className="shrink-0">
          <Link
            href={
              activeCommunity
                ? `/needs/create?community=${activeCommunity.id}`
                : "/needs/create"
            }
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Post a Need
          </Link>
        </Button>
      </div>

      {/* Community Selector & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 shadow-xs">
        {/* Active Community Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] shrink-0">
            <Building2 className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-neutral-400)] block">
              Active Community
            </span>

            {/* Dropdown to switch active community */}
            <div className="flex items-center gap-2">
              <form action="/needs" method="GET" className="inline">
                {typeParam && <input type="hidden" name="type" value={typeParam} />}
                <select
                  name="community"
                  defaultValue={activeCommunity?.id}
                  onChange={(e) => e.target.form?.submit()}
                  aria-label="Select active community"
                  className="rounded-md border border-[var(--color-neutral-300)] bg-white py-1 px-2.5 text-sm font-semibold text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none"
                >
                  {userCommunities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </form>

              {activeCommunity && (
                <Link
                  href={`/communities/${activeCommunity.id}`}
                  className="text-xs text-[var(--color-primary-600)] hover:underline hidden sm:inline"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* View Toggle: Community Feed vs My Needs */}
        <div className="flex items-center gap-1 rounded-lg bg-[var(--color-neutral-100)] p-1 shrink-0 self-start md:self-auto">
          <Link
            href={`/needs?community=${activeCommunity?.id ?? ""}${
              typeParam ? `&type=${typeParam}` : ""
            }`}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              !isMyNeedsView
                ? "bg-white text-[var(--color-neutral-900)] shadow-xs"
                : "text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]"
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            Community Feed
          </Link>

          <Link
            href={`/needs?view=my-needs${
              activeCommunity ? `&community=${activeCommunity.id}` : ""
            }`}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isMyNeedsView
                ? "bg-white text-[var(--color-neutral-900)] shadow-xs"
                : "text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            My Requests
          </Link>
        </div>
      </div>

      {/* Filter Tabs by Need Type */}
      {!isMyNeedsView && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <Link
            href={`/needs?community=${activeCommunity?.id ?? ""}`}
            className={`rounded-full px-3.5 py-1.5 font-medium transition-colors whitespace-nowrap ${
              !selectedType
                ? "bg-[var(--color-neutral-900)] text-white"
                : "bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
            }`}
          >
            All Needs
          </Link>

          {NEED_TYPES.map((t) => {
            const cfg = NEED_TYPE_CONFIG[t];
            const isCurrent = selectedType === t;

            return (
              <Link
                key={t}
                href={`/needs?community=${activeCommunity?.id ?? ""}&type=${t}`}
                className={`rounded-full px-3.5 py-1.5 font-medium transition-colors whitespace-nowrap ${
                  isCurrent
                    ? "bg-[var(--color-neutral-900)] text-white"
                    : "bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
                }`}
              >
                {cfg.shortLabel}
              </Link>
            );
          })}
        </div>
      )}

      {/* Needs Grid */}
      {needs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-neutral-300)] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)] mb-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
            {isMyNeedsView
              ? "You haven't posted any needs yet"
              : `No ${selectedType ? selectedType : ""} needs in ${
                  activeCommunity?.name ?? "this community"
                } right now`}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--color-neutral-500)]">
            {isMyNeedsView
              ? "When you need a tool, appliance, or local service, post a need and neighbors can respond."
              : "Be the first neighbor to post a request or borrow an item!"}
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="primary">
              <Link
                href={
                  activeCommunity
                    ? `/needs/create?community=${activeCommunity.id}`
                    : "/needs/create"
                }
              >
                Post the First Need
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {needs.map((need) => (
            <NeedCard key={need.id} need={need} />
          ))}
        </div>
      )}
    </div>
  );
}
