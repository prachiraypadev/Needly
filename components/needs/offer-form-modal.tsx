"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { createOffer } from "@/lib/actions/offers";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  X,
  Calendar,
  IndianRupee,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface OfferFormModalProps {
  needId: string;
  needTitle: string;
  requesterName: string;
  needType: string;
  budgetMax?: number | null;
}

export function OfferFormModal({
  needId,
  needTitle,
  requesterName,
  needType,
  budgetMax,
}: OfferFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [message, setMessage] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleOpen = () => {
    setIsOpen(true);
    setFieldErrors({});
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData();
    formData.append("need_id", needId);
    formData.append("message", message);
    if (priceAmount) formData.append("price_amount", priceAmount);
    if (availableFrom) formData.append("available_from", availableFrom);
    if (availableUntil) formData.append("available_until", availableUntil);

    startTransition(async () => {
      const res = await createOffer({}, formData);

      if (res?.errors) {
        setFieldErrors(res.errors);
        toast.error("Please fix the errors in your offer.");
      } else if (res?.message && !res.success) {
        toast.error(res.message);
      } else if (res?.success) {
        toast.success(res.message || "Your offer has been submitted!");
        setIsOpen(false);
        setMessage("");
        setPriceAmount("");
        setAvailableFrom("");
        setAvailableUntil("");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleOpen}
        className="shrink-0 cursor-pointer shadow-xs hover:shadow-md transition-all active:scale-95"
      >
        <MessageSquare className="mr-1.5 h-4 w-4" />
        Offer Help / I have this!
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-neutral-100)] pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary-600)] uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Make an Offer to Neighbor
                </div>
                <h2 className="text-lg font-bold text-[var(--color-neutral-900)] leading-snug">
                  Help {requesterName} with &ldquo;{needTitle}&rdquo;
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-lg p-1.5 text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Message */}
              <div>
                <label
                  htmlFor="offer-message"
                  className="block text-xs font-bold text-[var(--color-neutral-800)] mb-1"
                >
                  Your Message to {requesterName} *
                </label>
                <textarea
                  id="offer-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${requesterName}! I have this available in great condition. You're welcome to pick it up anytime...`}
                  className={`w-full rounded-xl border bg-[var(--color-neutral-50)] p-3 text-xs text-[var(--color-neutral-900)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all ${
                    fieldErrors.message
                      ? "border-red-500 focus:border-red-500"
                      : "border-[var(--color-neutral-300)] focus:border-[var(--color-primary-500)]"
                  }`}
                />
                {fieldErrors.message && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.message[0]}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-[var(--color-neutral-500)]">
                  Mention item condition, pickup location (e.g., flat number or tower), or any instructions.
                </p>
              </div>

              {/* Price / Compensation (Optional) */}
              <div>
                <label
                  htmlFor="offer-price"
                  className="block text-xs font-bold text-[var(--color-neutral-800)] mb-1"
                >
                  Offered Price / Fee (₹)
                </label>
                <div className="relative max-w-[200px]">
                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                  <input
                    id="offer-price"
                    type="number"
                    min="0"
                    step="1"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    placeholder="0 (Free)"
                    className="w-full rounded-xl border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] py-2 pl-8 pr-3 text-xs text-[var(--color-neutral-900)] focus:bg-white focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[var(--color-neutral-500)]">
                  {needType === "borrow"
                    ? "Leave blank or 0 for free neighborly sharing!"
                    : budgetMax != null
                    ? `Neighbor's max budget is ₹${budgetMax}. Leave empty for free.`
                    : "Leave empty or 0 if sharing for free."}
                </p>
                {fieldErrors.price_amount && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.price_amount[0]}
                  </p>
                )}
              </div>

              {/* Dates Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label
                    htmlFor="offer-from"
                    className="block text-xs font-bold text-[var(--color-neutral-800)] mb-1"
                  >
                    Available From
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                    <input
                      id="offer-from"
                      type="date"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] py-2 pl-8 pr-3 text-xs text-[var(--color-neutral-900)] focus:bg-white focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="offer-until"
                    className="block text-xs font-bold text-[var(--color-neutral-800)] mb-1"
                  >
                    Available Until
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                    <input
                      id="offer-until"
                      type="date"
                      value={availableUntil}
                      onChange={(e) => setAvailableUntil(e.target.value)}
                      className="w-full rounded-xl border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] py-2 pl-8 pr-3 text-xs text-[var(--color-neutral-900)] focus:bg-white focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--color-neutral-100)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending || !message.trim()}
                  className="cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Submitting Offer…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Send Offer to {requesterName}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
