import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  TRANSACTION_TYPE_CONFIG,
  ITEM_CONDITION_LABELS,
  type ListingType,
  type TransactionType,
  type PriceUnit,
  type ItemCondition,
  type ListingStatus,
} from "@/lib/validations/listing";
import {
  Package,
  Wrench,
  Building2,
  ArrowRight,
  PauseCircle,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

interface ListingCardProps {
  listing: {
    id: string;
    communityId: string;
    communityName: string;
    ownerId: string;
    ownerName: string;
    ownerAvatar: string | null;
    title: string;
    description: string | null;
    listingType: ListingType;
    transactionType: TransactionType;
    priceAmount: number | null;
    priceUnit: PriceUnit | null;
    quantity: number;
    condition: ItemCondition | null;
    status: ListingStatus;
    createdAt: string;
    categoryName: string | null;
    primaryImageUrl: string | null;
    isOwner: boolean;
  };
  showStatusBanner?: boolean;
}

export function ListingCard({
  listing,
  showStatusBanner = false,
}: ListingCardProps) {
  const transConfig = TRANSACTION_TYPE_CONFIG[listing.transactionType];
  // showStatusBanner: when true, always render the status overlay (used in My Listings view)
  const showStatusOverlay = showStatusBanner || listing.status !== "active";

  const formatPrice = () => {
    if (listing.transactionType === "lend") {
      return "Free to Borrow";
    }

    if (listing.priceAmount == null || listing.priceAmount === 0) {
      if (listing.priceUnit === "negotiable") return "Price Negotiable";
      return "Free";
    }

    const amount = `₹${listing.priceAmount.toLocaleString("en-IN")}`;
    switch (listing.priceUnit) {
      case "per_day":
        return `${amount} / day`;
      case "per_hour":
        return `${amount} / hr`;
      case "negotiable":
        return `${amount} (Negotiable)`;
      case "fixed":
      default:
        return amount;
    }
  };

  const priceStr = formatPrice();

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-xs transition-all hover:border-[var(--color-primary-500)]/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
    >
      <div>
        {/* Thumbnail Image Header */}
        <div className="relative aspect-video w-full bg-[var(--color-neutral-100)] overflow-hidden flex items-center justify-center">
          {listing.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.primaryImageUrl}
              alt={listing.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[var(--color-neutral-400)]">
              {listing.listingType === "service" ? (
                <Wrench className="h-8 w-8 text-[var(--color-neutral-300)]" />
              ) : (
                <Package className="h-8 w-8 text-[var(--color-neutral-300)]" />
              )}
              <span className="text-[11px] font-medium flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> No Photo
              </span>
            </div>
          )}

          {/* Badges on Image */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <Badge variant={transConfig.badgeVariant} className="text-xs shadow-xs">
              {transConfig.shortLabel}
            </Badge>
            {listing.listingType === "service" && (
              <Badge variant="outline" className="text-[11px] bg-white/95 text-[var(--color-neutral-800)]">
                Service
              </Badge>
            )}
          </div>

          {/* Status overlay if not active */}
          {showStatusOverlay && listing.status !== "active" && (
            <div className="absolute top-2.5 right-2.5">
              {listing.status === "paused" && (
                <Badge variant="warning" className="text-[11px] shadow-xs">
                  <PauseCircle className="mr-1 h-3 w-3" />
                  Paused
                </Badge>
              )}
              {listing.status === "unavailable" && (
                <Badge variant="outline" className="text-[11px] bg-white text-[var(--color-neutral-500)] shadow-xs">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Unavailable
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Category & Condition */}
          <div className="flex items-center justify-between text-xs text-[var(--color-neutral-500)]">
            <span>{listing.categoryName ?? "General"}</span>
            {listing.condition && (
              <span className="font-medium text-[var(--color-neutral-600)]">
                {ITEM_CONDITION_LABELS[listing.condition]?.label ?? listing.condition}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors leading-snug line-clamp-1">
            {listing.title}
          </h3>

          {/* Price */}
          <div className="text-sm font-extrabold text-[var(--color-primary-700)]">
            {priceStr}
          </div>

          {/* Description Snippet */}
          {listing.description && (
            <p className="line-clamp-2 text-xs text-[var(--color-neutral-600)] leading-relaxed">
              {listing.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Owner & Community */}
      <div className="border-t border-[var(--color-neutral-100)] p-3.5 pt-3 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={listing.ownerName} size="sm" />
          <div className="min-w-0">
            <span className="font-medium text-[var(--color-neutral-800)] truncate block">
              {listing.isOwner ? "You" : listing.ownerName}
            </span>
            <span className="text-[11px] text-[var(--color-neutral-400)] flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {listing.communityName}
            </span>
          </div>
        </div>

        <span className="flex items-center gap-1 font-semibold text-[var(--color-primary-600)] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
