import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getListingById } from "@/lib/db/listings";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingActions } from "@/components/listings/listing-actions";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  TRANSACTION_TYPE_CONFIG,
  ITEM_CONDITION_LABELS,
  DAYS_OF_WEEK,
  type TransactionType,
} from "@/lib/validations/listing";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

interface ListingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Offering Details — Jod",
    description: `View details of community listing ${id}.`,
  };
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id: listingId } = await params;
  const { userId } = await verifySession();

  // Authoritative server-side check: Fetch listing and verify membership
  const detail = await getListingById(listingId, userId);

  if (!detail) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(45,90%,90%)] text-[hsl(45,90%,30%)] mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
          Listing Access Restricted
        </h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)] max-w-md mx-auto">
          You must be an active member of this community to view this offering.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/listings">Back to Listings</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/communities">My Communities</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { listing, community, owner, category, media, availability, isOwner, canManage } =
    detail;
  const transConfig = TRANSACTION_TYPE_CONFIG[listing.transaction_type as TransactionType];

  const formatPrice = () => {
    if (listing.transaction_type === "lend") {
      return "Free to Borrow";
    }

    if (listing.price_amount == null || Number(listing.price_amount) === 0) {
      if (listing.price_unit === "negotiable") return "Price Negotiable";
      return "Free";
    }

    const amount = `₹${Number(listing.price_amount).toLocaleString("en-IN")}`;
    switch (listing.price_unit) {
      case "per_day":
        return `${amount} / day`;
      case "per_hour":
        return `${amount} / hour`;
      case "negotiable":
        return `${amount} (Negotiable)`;
      case "fixed":
      default:
        return amount;
    }
  };

  const priceStr = formatPrice();

  const ownerJoined = new Date(owner.createdAt).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href={`/listings?community=${community.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {community.name} Listings
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <ListingGallery
            media={media}
            title={listing.title}
            listingType={listing.listing_type as "item" | "service"}
          />

          {/* Details Card */}
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {/* Badges & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={transConfig.badgeVariant} className="text-xs">
                  {transConfig.label}
                </Badge>
                {category && (
                  <Badge variant="outline" className="text-xs">
                    {category.name}
                  </Badge>
                )}
              </div>

              {listing.status !== "active" && (
                <Badge variant="warning" className="text-xs">
                  Status: {listing.status}
                </Badge>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
                {listing.title}
              </h1>
              <div className="mt-2 text-xl font-extrabold text-[var(--color-primary-700)]">
                {priceStr}
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-[var(--color-neutral-100)] pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)] mb-2">
                Description
              </h3>
              <p className="text-sm text-[var(--color-neutral-700)] leading-relaxed whitespace-pre-line">
                {listing.description || (
                  <span className="italic text-[var(--color-neutral-400)]">
                    No description provided.
                  </span>
                )}
              </p>
            </div>

            {/* Specifications (Condition & Quantity) */}
            {listing.listing_type === "item" && (
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4 text-xs">
                {listing.condition && (
                  <div>
                    <span className="text-[11px] text-[var(--color-neutral-400)] block">
                      Condition
                    </span>
                    <span className="font-bold text-[var(--color-neutral-900)]">
                      {ITEM_CONDITION_LABELS[listing.condition]?.label ?? listing.condition}
                    </span>
                    <p className="text-[11px] text-[var(--color-neutral-500)] mt-0.5">
                      {ITEM_CONDITION_LABELS[listing.condition]?.description}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[11px] text-[var(--color-neutral-400)] block">
                    Available Quantity
                  </span>
                  <span className="font-bold text-[var(--color-neutral-900)] flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                    {listing.quantity} {listing.quantity === 1 ? "unit" : "units"}
                  </span>
                </div>
              </div>
            )}

            {/* Recurring Weekly Availability Schedule */}
            {availability.length > 0 && (
              <div className="border-t border-[var(--color-neutral-100)] pt-5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)]">
                  <Clock className="h-3.5 w-3.5 text-[var(--color-primary-600)]" />
                  <span>Weekly Availability Schedule</span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {availability.map((slot) => {
                    const dayLabel = DAYS_OF_WEEK.find(
                      (d) => d.value === slot.dayOfWeek
                    )?.label;

                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs"
                      >
                        <span className="font-semibold text-[var(--color-neutral-800)]">
                          {dayLabel}
                        </span>
                        <span className="text-[var(--color-neutral-600)]">
                          {slot.timeFrom} – {slot.timeTo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Owner Lifecycle Actions */}
          {canManage && (
            <ListingActions
              listingId={listing.id}
              currentStatus={listing.status}
              canManage={canManage}
            />
          )}

          {/* Reserved Neighbor Action Area (Phase 7 Request/Offer) */}
          {!isOwner && listing.status === "active" && (
            <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
                  Interested in this offering?
                </h3>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                  Request to borrow, rent, or buy this item from {owner.displayName}.
                </p>
              </div>

              <Button
                disabled
                variant="primary"
                size="sm"
                className="shrink-0 cursor-not-allowed"
              >
                <ShoppingBag className="mr-1.5 h-4 w-4" />
                Request Item (Coming in Phase 7)
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Owner Info Card */}
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)]">
              Offered By
            </h3>
            <div className="flex items-center gap-3">
              <Avatar name={owner.displayName} size="md" />
              <div>
                <span className="text-sm font-bold text-[var(--color-neutral-900)] block">
                  {owner.displayName}
                </span>
                <span className="text-xs text-[var(--color-neutral-500)]">
                  Member since {ownerJoined}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--color-primary-700)] bg-[var(--color-primary-50)] px-3 py-2 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Verified neighbor in {community.name}</span>
            </div>
          </div>

          {/* Community Info Card */}
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)]">
              Community
            </h3>
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-[var(--color-primary-600)] shrink-0" />
              <span className="text-sm font-bold text-[var(--color-neutral-900)] truncate">
                {community.name}
              </span>
            </div>
            <Link
              href={`/communities/${community.id}`}
              className="text-xs font-semibold text-[var(--color-primary-600)] hover:underline block pt-1"
            >
              View Community Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
