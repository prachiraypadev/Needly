import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getUserCommunities } from "@/lib/community/dal";
import {
  getCommunityListings,
  getCategories,
} from "@/lib/db/listings";
import { resolveActiveCommunity } from "@/lib/needs/dal";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import {
  ITEM_TRANSACTION_TYPES,
  TRANSACTION_TYPE_CONFIG,
  type ListingType,
  type TransactionType,
  type ItemCondition,
} from "@/lib/validations/listing";
import Link from "next/link";
import {
  Plus,
  Building2,
  Package,
  Wrench,
  Layers,
  Inbox,
  User,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Available in Your Community — Needly",
  description: "Browse tools, appliances, items, and services shared by neighbors in your community.",
};

interface ListingsPageProps {
  searchParams: Promise<{
    community?: string;
    type?: string; // 'item' | 'service'
    mode?: string; // 'lend' | 'rent' | 'sell' | 'service'
    category?: string;
    condition?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const { userId } = await verifySession();
  const {
    community: communityParam,
    type: typeParam,
    mode: modeParam,
    category: categoryParam,
    condition: conditionParam,
  } = await searchParams;

  // 1. Fetch user's joined communities
  const [userCommunities] = await Promise.all([
    getUserCommunities(userId),
    getCategories(), // fetched for future category filter UI
  ]);

  if (userCommunities.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
          Join a Community to See Offerings
        </h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)] max-w-md mx-auto">
          Needly connects you to verified neighbors in your apartment, society, or college. Join a community with an invite code or start your own to see shared items.
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
  const activeCommunity = await resolveActiveCommunity(userId, communityParam);

  const listingTypeFilter =
    typeParam === "item" || typeParam === "service"
      ? (typeParam as ListingType)
      : undefined;

  const transactionTypeFilter =
    modeParam && ["lend", "rent", "sell", "service"].includes(modeParam)
      ? (modeParam as TransactionType)
      : undefined;

  // 3. Fetch Listings strictly within active community
  const listings = activeCommunity
    ? await getCommunityListings(activeCommunity.id, userId, {
        listingType: listingTypeFilter,
        transactionType: transactionTypeFilter,
        categoryId: categoryParam,
        condition: conditionParam as ItemCondition | undefined,
      })
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Community Supply & Offerings
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Borrow, rent, or buy items and services offered by neighbors in your community.
          </p>
        </div>

        <Button asChild variant="primary" size="sm" className="shrink-0">
          <Link
            href={
              activeCommunity
                ? `/listings/create?community=${activeCommunity.id}`
                : "/listings/create"
            }
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Offer an Item or Service
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

            <div className="flex items-center gap-2">
              <form action="/listings" method="GET" className="inline">
                {typeParam && <input type="hidden" name="type" value={typeParam} />}
                {modeParam && <input type="hidden" name="mode" value={modeParam} />}
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

        {/* View Toggle: Community Feed vs My Listings */}
        <div className="flex items-center gap-1 rounded-lg bg-[var(--color-neutral-100)] p-1 shrink-0 self-start md:self-auto">
          <Link
            href={`/listings?community=${activeCommunity?.id ?? ""}`}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-white text-[var(--color-neutral-900)] shadow-xs"
          >
            <Inbox className="h-3.5 w-3.5" />
            Community Supply
          </Link>

          <Link
            href="/my-listings"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)] transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            My Offerings
          </Link>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* All */}
        <Link
          href={`/listings?community=${activeCommunity?.id ?? ""}`}
          className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
            !typeParam && !modeParam
              ? "bg-[var(--color-neutral-900)] text-white"
              : "bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
          }`}
        >
          All Offerings
        </Link>

        {/* Items */}
        <Link
          href={`/listings?community=${activeCommunity?.id ?? ""}&type=item`}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-colors ${
            typeParam === "item" && !modeParam
              ? "bg-[var(--color-neutral-900)] text-white"
              : "bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          Items Only
        </Link>

        {/* Services */}
        <Link
          href={`/listings?community=${activeCommunity?.id ?? ""}&type=service`}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-colors ${
            typeParam === "service"
              ? "bg-[var(--color-neutral-900)] text-white"
              : "bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
          }`}
        >
          <Wrench className="h-3.5 w-3.5" />
          Services Only
        </Link>

        {/* Item Modes: Lend, Rent, Sell */}
        {ITEM_TRANSACTION_TYPES.map((m) => {
          const cfg = TRANSACTION_TYPE_CONFIG[m];
          const isSelected = modeParam === m;

          return (
            <Link
              key={m}
              href={`/listings?community=${activeCommunity?.id ?? ""}&mode=${m}`}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                isSelected
                  ? "bg-[var(--color-neutral-900)] text-white"
                  : "bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
              }`}
            >
              {cfg.shortLabel}
            </Link>
          );
        })}
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-neutral-300)] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)] mb-4">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
            No offerings available in {activeCommunity?.name ?? "this community"} yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--color-neutral-500)]">
            Be the first to share an unused tool, ladder, appliance, or offer your repair skills!
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="primary">
              <Link
                href={
                  activeCommunity
                    ? `/listings/create?community=${activeCommunity.id}`
                    : "/listings/create"
                }
              >
                Offer an Item or Service
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
