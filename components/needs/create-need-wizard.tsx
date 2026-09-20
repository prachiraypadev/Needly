"use client";

import { useState, useActionState, useEffect } from "react";
import { createNeed } from "@/lib/actions/needs";
import {
  NEED_TYPES,
  NEED_TYPE_CONFIG,
  type NeedType,
  type CreateNeedFormState,
} from "@/lib/validations/need";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Layers,
  Building2,
  HelpCircle,
  Zap,
} from "lucide-react";

interface CreateNeedWizardProps {
  communities: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  initialCommunityId?: string;
}

export function CreateNeedWizard({
  communities,
  categories,
  initialCommunityId,
}: CreateNeedWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState("");
  const [communityId, setCommunityId] = useState(
    initialCommunityId || (communities[0]?.id ?? "")
  );
  const [needType, setNeedType] = useState<NeedType>("borrow");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [neededFrom, setNeededFrom] = useState("");
  const [neededUntil, setNeededUntil] = useState("");

  const [state, action, pending] = useActionState<CreateNeedFormState, FormData>(
    createNeed,
    undefined
  );

  const selectedCommunity = communities.find((c) => c.id === communityId);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const typeConfig = NEED_TYPE_CONFIG[needType];

  // Validation before advancing to next step
  const canAdvanceStep1 = title.trim().length >= 3 && !!communityId;
  const canAdvanceStep2 = !!needType;
  const canAdvanceStep3 = true; // optional details

  // Global Enter Key Listener across all steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement | null;
        // Don't intercept Enter inside textareas or during server action submission
        if (target?.tagName === "TEXTAREA" || pending) return;

        if (step === 1 && canAdvanceStep1) {
          e.preventDefault();
          setStep(2);
        } else if (step === 2 && canAdvanceStep2) {
          e.preventDefault();
          setStep(3);
        } else if (step === 3 && canAdvanceStep3) {
          e.preventDefault();
          setStep(4);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, canAdvanceStep1, canAdvanceStep2, canAdvanceStep3, pending]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-xs font-bold text-white">
            {step}
          </span>
          <span className="text-sm font-semibold text-[var(--color-neutral-900)]">
            {step === 1 && "What do you need?"}
            {step === 2 && "How do you want it?"}
            {step === 3 && "Additional Details"}
            {step === 4 && "Review & Publish"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
          <span>Step {step} of 4</span>
        </div>
      </div>

      {/* Global Server Action Error */}
      {state?.message && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-lg border border-[var(--color-error-light,hsl(0,70%,90%))] bg-[hsl(0,70%,97%)] px-4 py-3 text-sm text-[hsl(0,65%,40%)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* STEP 1: What do you need? */}
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canAdvanceStep1) setStep(2);
          }}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="wizard-community"
              className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
            >
              Post to Community <span className="text-[var(--color-primary-600)]">*</span>
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
              <select
                id="wizard-community"
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {state?.errors?.community_id && (
              <p className="mt-1 text-xs text-[hsl(0,65%,45%)]">
                {state.errors.community_id[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="wizard-title"
              className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
            >
              What are you looking for? <span className="text-[var(--color-primary-600)]">*</span>
            </label>
            <div className="relative">
              <input
                id="wizard-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Drilling machine for this weekend, Projector, Badminton racket"
                autoFocus
                className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-3 px-3.5 text-base text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-[var(--color-neutral-500)]">
              Start with a clear, concise sentence describing the item or help you need. (Press Enter to continue)
            </p>
            {state?.errors?.title && (
              <p className="mt-1 text-xs text-[hsl(0,65%,45%)]">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={!canAdvanceStep1}
              className="flex items-center gap-1.5"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: How do you want it? */}
      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canAdvanceStep2) setStep(3);
          }}
          className="space-y-5"
        >
          <p className="text-sm text-[var(--color-neutral-600)]">
            Choose how you would prefer community members to help fulfill this need:
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {NEED_TYPES.map((typeKey) => {
              const cfg = NEED_TYPE_CONFIG[typeKey];
              const isSelected = needType === typeKey;

              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => setNeedType(typeKey)}
                  className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--color-primary-600)] bg-[var(--color-primary-50)]/40 shadow-xs"
                      : "border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Badge variant={cfg.badgeVariant} className="text-xs">
                      {cfg.shortLabel}
                    </Badge>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary-600)]" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--color-neutral-900)]">
                    {cfg.label}
                  </h4>
                  <p className="text-xs text-[var(--color-neutral-500)] mt-1 leading-relaxed">
                    {cfg.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-neutral-100)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(4)}
                className="text-xs text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)] hidden sm:inline-flex"
              >
                Skip optional details ➔
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!canAdvanceStep2}
                className="flex items-center gap-1.5"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 3: Additional Details */}
      {step === 3 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canAdvanceStep3) setStep(4);
          }}
          className="space-y-5"
        >
          <div className="rounded-lg bg-[var(--color-primary-50)]/50 border border-[var(--color-primary-200)]/60 px-3.5 py-2.5 flex items-center justify-between text-xs text-[var(--color-primary-800)]">
            <span>All fields below are optional. Want to post fast?</span>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="font-bold underline text-xs text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)] cursor-pointer"
            >
              Skip to Review ➔
            </button>
          </div>
          {/* Category */}
          <div>
            <label
              htmlFor="wizard-category"
              className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
            >
              Category <span className="text-xs font-normal text-[var(--color-neutral-400)]">(optional)</span>
            </label>
            <select
              id="wizard-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="wizard-description"
              className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
            >
              Description / Notes{" "}
              <span className="text-xs font-normal text-[var(--color-neutral-400)]">
                (optional)
              </span>
            </label>
            <textarea
              id="wizard-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add specifics like size, brand preference, or why you need it…"
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 resize-none"
            />
          </div>

          {/* Dates row */}
          {typeConfig.hasDates && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="wizard-needed-from"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
                >
                  Needed From
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                  <input
                    id="wizard-needed-from"
                    type="date"
                    value={neededFrom}
                    onChange={(e) => setNeededFrom(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="wizard-needed-until"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
                >
                  Needed Until / Return By
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                  <input
                    id="wizard-needed-until"
                    type="date"
                    value={neededUntil}
                    onChange={(e) => setNeededUntil(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Budget row for Rent, Buy, Service */}
          {typeConfig.hasBudget && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="wizard-budget-min"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
                >
                  Min Budget (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                  <input
                    id="wizard-budget-min"
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="wizard-budget-max"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
                >
                  Max Budget (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                  <input
                    id="wizard-budget-max"
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label
              htmlFor="wizard-quantity"
              className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
            >
              Quantity Needed
            </label>
            <div className="relative max-w-[140px]">
              <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
              <input
                id="wizard-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-neutral-100)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!canAdvanceStep3}
              className="flex items-center gap-1.5"
            >
              Review Need
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 4: Review & Publish Form */}
      {step === 4 && (
        <form action={action} className="space-y-6">
          {/* Hidden Inputs to submit via standard form action */}
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="community_id" value={communityId} />
          <input type="hidden" name="need_type" value={needType} />
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="quantity" value={quantity} />
          <input type="hidden" name="budget_min" value={budgetMin} />
          <input type="hidden" name="budget_max" value={budgetMax} />
          <input type="hidden" name="needed_from" value={neededFrom} />
          <input type="hidden" name="needed_until" value={neededUntil} />

          {/* Preview Card */}
          <div className="rounded-xl border-2 border-[var(--color-primary-300)] bg-[var(--color-primary-50)]/30 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-700)] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Preview of your Need
              </span>
              <Badge variant={typeConfig.badgeVariant} className="text-xs">
                {typeConfig.shortLabel}
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--color-neutral-900)]">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
                  {description}
                </p>
              )}
            </div>

            <div className="grid gap-2 text-xs text-[var(--color-neutral-700)] border-t border-[var(--color-primary-200)]/60 pt-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                <span>
                  Posting in: <strong>{selectedCommunity?.name}</strong>
                </span>
              </div>

              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Category: <strong>{selectedCategory.name}</strong>
                  </span>
                </div>
              )}

              {(budgetMin || budgetMax) && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Budget:{" "}
                    <strong>
                      {budgetMin && budgetMax
                        ? `₹${budgetMin} – ₹${budgetMax}`
                        : budgetMax
                        ? `Up to ₹${budgetMax}`
                        : `From ₹${budgetMin}`}
                    </strong>
                  </span>
                </div>
              )}

              {(neededFrom || neededUntil) && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Dates:{" "}
                    <strong>
                      {neededFrom && neededUntil
                        ? `${neededFrom} to ${neededUntil}`
                        : neededFrom || neededUntil}
                    </strong>
                  </span>
                </div>
              )}

              {quantity > 1 && (
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Quantity: <strong>{quantity}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-neutral-100)]">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit Details
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={pending}
              aria-disabled={pending}
              className="min-w-[160px]"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing Need…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Publish Need
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
