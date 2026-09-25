"use client";

import React, { useTransition } from "react";
import { toast } from "sonner";
import {
  acceptOfferAction,
  rejectOfferAction,
  withdrawOfferAction,
  completeTransactionAction,
} from "@/lib/actions/offers";
import type {
  OfferDetailView,
  TransactionDetailView,
} from "@/lib/needs/dal";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OfferFormModal } from "@/components/needs/offer-form-modal";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  IndianRupee,
  Loader2,
  Handshake,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface NeedOffersSectionProps {
  needId: string;
  needTitle: string;
  needStatus: string;
  needType: string;
  budgetMax?: number | null;
  requesterName: string;
  isOwner: boolean;
  canManage: boolean;
  offers: OfferDetailView[];
  myOffer: OfferDetailView | null;
  activeTransaction: TransactionDetailView | null;
  currentUserId: string;
}

export function NeedOffersSection({
  needId,
  needTitle,
  needStatus,
  needType,
  budgetMax,
  requesterName,
  isOwner,
  canManage,
  offers,
  myOffer,
  activeTransaction,
  currentUserId,
}: NeedOffersSectionProps) {
  const [isPending, startTransition] = useTransition();

  const handleAcceptOffer = (offerId: string, providerName: string) => {
    if (
      !window.confirm(
        `Accept ${providerName}'s offer? This will initiate the transaction and notify your neighbor.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await acceptOfferAction(offerId, needId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Accepted ${providerName}'s offer! Transaction initiated.`);
      }
    });
  };

  const handleRejectOffer = (offerId: string, providerName: string) => {
    if (!window.confirm(`Decline ${providerName}'s offer?`)) {
      return;
    }

    startTransition(async () => {
      const res = await rejectOfferAction(offerId, needId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Offer declined.");
      }
    });
  };

  const handleWithdrawOffer = (offerId: string) => {
    if (!window.confirm("Are you sure you want to withdraw your offer?")) {
      return;
    }

    startTransition(async () => {
      const res = await withdrawOfferAction(offerId, needId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Your offer has been withdrawn.");
      }
    });
  };

  const handleCompleteTransaction = (txId: string) => {
    if (
      !window.confirm(
        "Confirm that the item has been returned or service completed successfully?"
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await completeTransactionAction(txId, needId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Transaction marked as completed! Need fulfilled.");
      }
    });
  };

  const getOfferBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
            <Clock className="mr-1 h-3 w-3" />
            Pending Response
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Offer Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-gray-400">
            <XCircle className="mr-1 h-3 w-3" />
            Declined
          </Badge>
        );
      case "withdrawn":
        return (
          <Badge variant="outline" className="text-gray-400">
            Withdrawn
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. ACTIVE TRANSACTION CARD (When accepted & in progress or fulfilled) */}
      {activeTransaction && (
        <div className="rounded-2xl border-2 border-[var(--color-primary-200)] bg-gradient-to-br from-white to-[var(--color-primary-50)]/30 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-600)] text-white shadow-xs">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
                  Neighbor Match Active
                </h3>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {activeTransaction.status === "completed"
                    ? "Transaction completed & need fulfilled"
                    : "Exchange in progress between neighbors"}
                </p>
              </div>
            </div>

            <Badge
              variant={
                activeTransaction.status === "completed" ? "success" : "warning"
              }
              className="text-xs"
            >
              {activeTransaction.status === "completed"
                ? "Completed"
                : "Active Handshake"}
            </Badge>
          </div>

          {/* Parties matched */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-3.5 flex items-center gap-3">
              <Avatar name={activeTransaction.requesterName} size="sm" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-[var(--color-neutral-400)] block uppercase">
                  Requested By
                </span>
                <span className="text-xs font-bold text-[var(--color-neutral-900)] truncate block">
                  {activeTransaction.requesterName}
                  {activeTransaction.requesterId === currentUserId && " (You)"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-3.5 flex items-center gap-3">
              <Avatar name={activeTransaction.providerName} size="sm" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-[var(--color-neutral-400)] block uppercase">
                  Helping Neighbor
                </span>
                <span className="text-xs font-bold text-[var(--color-neutral-900)] truncate block">
                  {activeTransaction.providerName}
                  {activeTransaction.providerId === currentUserId && " (You)"}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Finish Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--color-neutral-200)]">
            <div className="text-xs">
              <span className="text-[var(--color-neutral-500)]">Agreed Compensation: </span>
              <strong className="text-[var(--color-neutral-900)]">
                {activeTransaction.agreedAmount != null &&
                activeTransaction.agreedAmount > 0
                  ? `₹${activeTransaction.agreedAmount}`
                  : "Free neighborly exchange"}
              </strong>
            </div>

            {/* Complete Transaction Button (if still active) */}
            {activeTransaction.status !== "completed" &&
              (activeTransaction.requesterId === currentUserId ||
                activeTransaction.providerId === currentUserId ||
                canManage) && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    handleCompleteTransaction(activeTransaction.id)
                  }
                  className="cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Mark Returned / Completed
                    </>
                  )}
                </Button>
              )}
          </div>
        </div>
      )}

      {/* 2. NEIGHBOR VIEW: SUBMITTED OFFER OR MAKE AN OFFER CTA */}
      {!isOwner && (
        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs space-y-4">
          {myOffer ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-primary-600)]" />
                  <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
                    Your Offer to Help
                  </h3>
                </div>
                {getOfferBadge(myOffer.status)}
              </div>

              <div className="rounded-xl bg-[var(--color-neutral-50)] p-4 text-xs space-y-2.5">
                <p className="text-[var(--color-neutral-800)] whitespace-pre-line leading-relaxed">
                  &ldquo;{myOffer.message}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[var(--color-neutral-600)]">
                  <div className="flex items-center gap-1 font-semibold text-[var(--color-neutral-900)]">
                    <IndianRupee className="h-3.5 w-3.5 text-[var(--color-neutral-400)]" />
                    {myOffer.priceAmount != null && myOffer.priceAmount > 0
                      ? `₹${myOffer.priceAmount}`
                      : "Free"}
                  </div>

                  {(myOffer.availableFrom || myOffer.availableUntil) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[var(--color-neutral-400)]" />
                      <span>
                        {myOffer.availableFrom && myOffer.availableUntil
                          ? `${myOffer.availableFrom} to ${myOffer.availableUntil}`
                          : myOffer.availableFrom || myOffer.availableUntil}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {myOffer.status === "pending" && needStatus === "open" && (
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleWithdrawOffer(myOffer.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Withdraw Offer
                  </Button>
                </div>
              )}
            </div>
          ) : needStatus === "open" ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
                  Can you help {requesterName}?
                </h3>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                  Have this item or willing to lend a hand? Make an offer directly to your neighbor.
                </p>
              </div>

              <OfferFormModal
                needId={needId}
                needTitle={needTitle}
                requesterName={requesterName}
                needType={needType}
                budgetMax={budgetMax}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* 3. REQUESTER / ADMIN VIEW: OFFERS LIST */}
      {canManage && (
        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-neutral-900)]">
                Offers Received ({offers.length})
              </h3>
              <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                Neighbors who offered to lend or help with this request
              </p>
            </div>
          </div>

          {offers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--color-neutral-400)] space-y-1">
              <p>No offers received yet.</p>
              <p className="text-[11px] text-[var(--color-neutral-400)]">
                Neighbors in your community will see your request on their feed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-neutral-100)] space-y-4">
              {offers.map((offer) => (
                <div key={offer.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={offer.providerName} size="sm" />
                      <div>
                        <span className="text-xs font-bold text-[var(--color-neutral-900)] block">
                          {offer.providerName}
                        </span>
                        <span className="text-[11px] text-[var(--color-neutral-400)]">
                          Offered on{" "}
                          {new Date(offer.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {getOfferBadge(offer.status)}
                  </div>

                  {offer.message && (
                    <p className="text-xs text-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] p-3 rounded-xl whitespace-pre-line leading-relaxed">
                      &ldquo;{offer.message}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-neutral-600)]">
                      <span className="font-semibold text-[var(--color-neutral-900)] flex items-center">
                        <IndianRupee className="h-3 w-3 mr-0.5 text-[var(--color-neutral-400)]" />
                        {offer.priceAmount != null && offer.priceAmount > 0
                          ? `₹${offer.priceAmount}`
                          : "Free to borrow"}
                      </span>

                      {(offer.availableFrom || offer.availableUntil) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[var(--color-neutral-400)]" />
                          {offer.availableFrom && offer.availableUntil
                            ? `${offer.availableFrom} to ${offer.availableUntil}`
                            : offer.availableFrom || offer.availableUntil}
                        </span>
                      )}
                    </div>

                    {/* Accept / Decline actions if need is open and offer is pending */}
                    {isOwner &&
                      needStatus === "open" &&
                      offer.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              handleRejectOffer(offer.id, offer.providerName)
                            }
                            className="text-xs text-[var(--color-neutral-600)] hover:text-red-600 cursor-pointer"
                          >
                            Decline
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              handleAcceptOffer(offer.id, offer.providerName)
                            }
                            className="text-xs cursor-pointer shadow-2xs"
                          >
                            {isPending ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            )}
                            Accept Offer
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
