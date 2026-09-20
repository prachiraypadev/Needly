import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getNeedDetail } from "@/lib/needs/dal";
import { NeedActions } from "@/components/needs/need-actions";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  NEED_TYPE_CONFIG,
  type NeedType,
} from "@/lib/validations/need";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Layers,
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";

interface NeedDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: NeedDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Need Details — Jod`,
    description: `View details of community request ${id}.`,
  };
}

export default async function NeedDetailPage({ params }: NeedDetailPageProps) {
  const { id: needId } = await params;
  const { userId } = await verifySession();

  // Authoritative server-side check: Fetch need & verify caller belongs to community
  const detail = await getNeedDetail(needId, userId);

  if (!detail) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(45,90%,90%)] text-[hsl(45,90%,30%)] mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
          Need Access Restricted
        </h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)] max-w-md mx-auto">
          You must be an active member of this community to view this request.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/needs">Back to Needs Feed</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/communities">My Communities</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { need, community, requester, category, isOwner, canManage } = detail;
  const typeConfig = NEED_TYPE_CONFIG[need.need_type as NeedType];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="text-xs border-[var(--color-primary-300)] text-[var(--color-primary-700)] bg-[var(--color-primary-50)]">
            <Clock className="mr-1 h-3 w-3" />
            Open for Offers
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="warning" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "fulfilled":
        return (
          <Badge variant="success" className="text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Fulfilled
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-xs text-[var(--color-neutral-400)]">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const createdDate = new Date(need.created_at).toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const requesterJoined = new Date(requester.createdAt).toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href={`/needs?community=${community.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {community.name} Needs
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {/* Badges & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={typeConfig.badgeVariant} className="text-xs">
                  {typeConfig.label}
                </Badge>
                {category && (
                  <Badge variant="outline" className="text-xs">
                    {category.name}
                  </Badge>
                )}
              </div>
              {getStatusBadge(need.status)}
            </div>

            {/* Title & Created Date */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)] leading-tight">
                {need.title}
              </h1>
              <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
                Posted on {createdDate} in{" "}
                <Link
                  href={`/communities/${community.id}`}
                  className="font-medium text-[var(--color-primary-600)] hover:underline"
                >
                  {community.name}
                </Link>
              </p>
            </div>

            {/* Description */}
            <div className="border-t border-[var(--color-neutral-100)] pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)] mb-2">
                Details & Notes
              </h3>
              <p className="text-sm text-[var(--color-neutral-700)] leading-relaxed whitespace-pre-line">
                {need.description || (
                  <span className="italic text-[var(--color-neutral-400)]">
                    No additional details provided.
                  </span>
                )}
              </p>
            </div>

            {/* Specification Grid */}
            <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4 text-xs">
              {/* Quantity */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-neutral-400)] block">
                    Quantity
                  </span>
                  <span className="font-semibold text-[var(--color-neutral-800)]">
                    {need.quantity} {need.quantity === 1 ? "unit" : "units"}
                  </span>
                </div>
              </div>

              {/* Budget */}
              {(need.budget_min != null || need.budget_max != null) && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-neutral-400)] block">
                      Budget
                    </span>
                    <span className="font-semibold text-[var(--color-neutral-800)]">
                      {need.budget_min != null && need.budget_max != null
                        ? `₹${need.budget_min} – ₹${need.budget_max}`
                        : need.budget_max != null
                        ? `Up to ₹${need.budget_max}`
                        : `From ₹${need.budget_min}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Dates */}
              {(need.needed_from || need.needed_until) && (
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-neutral-400)] block">
                      Timeline
                    </span>
                    <span className="font-semibold text-[var(--color-neutral-800)]">
                      {need.needed_from && need.needed_until
                        ? `${new Date(need.needed_from).toLocaleDateString(
                            "en-IN"
                          )} to ${new Date(
                            need.needed_until
                          ).toLocaleDateString("en-IN")}`
                        : new Date(
                            need.needed_from || need.needed_until!
                          ).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Fulfillment Note if fulfilled */}
            {need.fulfillment_notes && (
              <div className="rounded-lg bg-[var(--color-success-light)]/40 border border-[var(--color-success-light)] p-3 text-xs text-[var(--color-success)]">
                <strong>Fulfillment Notes:</strong> {need.fulfillment_notes}
              </div>
            )}
          </div>

          {/* Requester Action Panel */}
          {canManage && (
            <NeedActions
              needId={need.id}
              currentStatus={need.status}
              isOwner={isOwner}
              canManage={canManage}
            />
          )}

          {/* Neighbor Response Placeholder for Phase 6 Offers */}
          {!isOwner && need.status === "open" && (
            <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
                  Can you help {requester.displayName}?
                </h3>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                  Have this item or willing to provide this service? Make an offer to your neighbor.
                </p>
              </div>

              <Button disabled variant="primary" size="sm" className="shrink-0 cursor-not-allowed">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Make an Offer (Coming in Phase 6)
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar: Requester & Community Info */}
        <div className="space-y-6">
          {/* Requester Card */}
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)]">
              Requested By
            </h3>
            <div className="flex items-center gap-3">
              <Avatar name={requester.displayName} size="md" />
              <div>
                <span className="text-sm font-bold text-[var(--color-neutral-900)] block">
                  {requester.displayName}
                </span>
                <span className="text-xs text-[var(--color-neutral-500)]">
                  Member since {requesterJoined}
                </span>
              </div>
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
