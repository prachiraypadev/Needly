import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getUserListings } from "@/lib/db/listings";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import {
  LISTING_STATUSES,
  type ListingStatus,
} from "@/lib/validations/listing";
import Link from "next/link";
import { Plus, Package, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "My Offerings — Jod",
  description: "Manage your shared items and services across your communities.",
};

interface MyListingsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function MyListingsPage({
  searchParams,
}: MyListingsPageProps) {
  const { userId } = await verifySession();
  const { status: statusParam } = await searchParams;

  const currentStatus = LISTING_STATUSES.includes(statusParam as ListingStatus)
    ? (statusParam as ListingStatus)
    : undefined;

  const listings = await getUserListings(userId, currentStatus);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="mb-2">
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Community Supply
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            My Offerings & Shared Items
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Manage the items you are lending, renting, or selling, and update your services.
          </p>
        </div>

        <Button asChild variant="primary" size="sm" className="shrink-0">
          <Link href="/listings/create" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Offer Another Item
          </Link>
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-[var(--color-neutral-200)]">
        <Link
          href="/my-listings"
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 -mb-px ${
            !currentStatus
              ? "border-[var(--color-primary-600)] text-[var(--color-primary-700)]"
              : "border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)]"
          }`}
        >
          All Active & Paused
        </Link>

        <Link
          href="/my-listings?status=active"
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 -mb-px ${
            currentStatus === "active"
              ? "border-[var(--color-primary-600)] text-[var(--color-primary-700)]"
              : "border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)]"
          }`}
        >
          Active
        </Link>

        <Link
          href="/my-listings?status=paused"
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 -mb-px ${
            currentStatus === "paused"
              ? "border-[var(--color-primary-600)] text-[var(--color-primary-700)]"
              : "border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)]"
          }`}
        >
          Paused
        </Link>

        <Link
          href="/my-listings?status=unavailable"
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 -mb-px ${
            currentStatus === "unavailable"
              ? "border-[var(--color-primary-600)] text-[var(--color-primary-700)]"
              : "border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)]"
          }`}
        >
          Unavailable
        </Link>

        <Link
          href="/my-listings?status=archived"
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 -mb-px ${
            currentStatus === "archived"
              ? "border-[var(--color-primary-600)] text-[var(--color-primary-700)]"
              : "border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)]"
          }`}
        >
          Archived
        </Link>
      </div>

      {/* Grid / Empty State */}
      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-neutral-300)] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)] mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
            No {currentStatus ? currentStatus : ""} listings found
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--color-neutral-500)]">
            Offer an item you own or a service you provide to start helping neighbors in your community.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="primary">
              <Link href="/listings/create">Create your First Listing</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} showStatusBanner />
          ))}
        </div>
      )}
    </div>
  );
}
