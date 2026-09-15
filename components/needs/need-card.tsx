import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  NEED_TYPE_CONFIG,
  type NeedType,
  type NeedStatus,
} from "@/lib/validations/need";
import {
  Calendar,
  IndianRupee,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
} from "lucide-react";

interface NeedCardProps {
  need: {
    id: string;
    communityId: string;
    communityName: string;
    requesterId: string;
    requesterName: string;
    requesterAvatar: string | null;
    title: string;
    description: string | null;
    needType: NeedType;
    budgetMin: number | null;
    budgetMax: number | null;
    quantity: number;
    neededFrom: string | null;
    neededUntil: string | null;
    status: NeedStatus;
    createdAt: string;
    categoryName: string | null;
    isOwner: boolean;
  };
}

export function NeedCard({ need }: NeedCardProps) {
  const typeConfig = NEED_TYPE_CONFIG[need.needType];

  const getStatusBadge = (status: NeedStatus) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="text-[11px] py-0 border-[var(--color-primary-300)] text-[var(--color-primary-700)] bg-[var(--color-primary-50)]">
            <Clock className="mr-1 h-3 w-3" />
            Open
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="warning" className="text-[11px] py-0">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "fulfilled":
        return (
          <Badge variant="success" className="text-[11px] py-0">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Fulfilled
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-[11px] py-0 text-[var(--color-neutral-400)]">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDates = () => {
    if (!need.neededFrom && !need.neededUntil) return null;
    if (need.neededFrom && need.neededUntil) {
      const from = new Date(need.neededFrom).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      const until = new Date(need.neededUntil).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      return `${from} – ${until}`;
    }
    const singleDate = new Date(need.neededFrom || need.neededUntil!).toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "numeric",
      }
    );
    return `By ${singleDate}`;
  };

  const dateStr = formatDates();

  const formatBudget = () => {
    if (need.budgetMin == null && need.budgetMax == null) return null;
    if (need.budgetMin != null && need.budgetMax != null) {
      if (need.budgetMin === need.budgetMax) return `₹${need.budgetMin}`;
      return `₹${need.budgetMin} – ₹${need.budgetMax}`;
    }
    if (need.budgetMax != null) return `Up to ₹${need.budgetMax}`;
    return `From ₹${need.budgetMin}`;
  };

  const budgetStr = formatBudget();

  return (
    <Link
      href={`/needs/${need.id}`}
      className="group flex flex-col justify-between rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs transition-all hover:border-[var(--color-primary-500)]/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
    >
      <div>
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={typeConfig.badgeVariant} className="text-xs">
              {typeConfig.shortLabel}
            </Badge>

            {need.categoryName && (
              <span className="text-xs text-[var(--color-neutral-500)] font-medium">
                {need.categoryName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {getStatusBadge(need.status)}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors leading-snug">
          {need.title}
        </h3>

        {need.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-[var(--color-neutral-600)] leading-relaxed">
            {need.description}
          </p>
        )}

        {/* Metadata items */}
        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[var(--color-neutral-600)]">
          {/* Quantity if > 1 */}
          {need.quantity > 1 && (
            <span className="flex items-center gap-1 font-medium text-[var(--color-neutral-700)]">
              <Layers className="h-3.5 w-3.5 text-[var(--color-neutral-400)]" />
              Qty: {need.quantity}
            </span>
          )}

          {/* Budget */}
          {budgetStr && (
            <span className="flex items-center gap-0.5 font-semibold text-[var(--color-neutral-800)]">
              <IndianRupee className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
              {budgetStr}
            </span>
          )}

          {/* Dates */}
          {dateStr && (
            <span className="flex items-center gap-1 text-[var(--color-neutral-500)]">
              <Calendar className="h-3.5 w-3.5 text-[var(--color-neutral-400)]" />
              {dateStr}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Requester row */}
      <div className="mt-5 flex items-center justify-between border-t border-[var(--color-neutral-100)] pt-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={need.requesterName} size="sm" />
          <div className="min-w-0 truncate">
            <span className="font-medium text-[var(--color-neutral-800)] truncate block">
              {need.isOwner ? "You" : need.requesterName}
            </span>
            <span className="text-[11px] text-[var(--color-neutral-400)] flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {need.communityName}
            </span>
          </div>
        </div>

        <span className="flex items-center gap-1 font-semibold text-[var(--color-primary-600)] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
          View Need <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
