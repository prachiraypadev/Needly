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
  Clock,
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
  initialType?: NeedType;
  initialTitle?: string;
}

export function CreateNeedWizard({
  communities,
  categories,
  initialCommunityId,
  initialType,
  initialTitle,
}: CreateNeedWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState(initialTitle || "");
  const [communityId, setCommunityId] = useState(
    initialCommunityId || (communities[0]?.id ?? "")
  );
  const [needType, setNeedType] = useState<NeedType>(
    initialType && NEED_TYPES.includes(initialType) ? initialType : "borrow"
  );

  useEffect(() => {
    if (initialTitle) {
      setTitle(initialTitle);
    }
  }, [initialTitle]);

  useEffect(() => {
    if (initialType && NEED_TYPES.includes(initialType)) {
      setNeedType(initialType);
    }
  }, [initialType]);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number | string>(1);
  const [daysInput, setDaysInput] = useState<string>("");
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

  // Helper functions for Duration / Days
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const addDaysToDate = (startDateStr: string, days: number) => {
    const base = startDateStr ? new Date(startDateStr) : new Date();
    base.setDate(base.getDate() + days);
    return base.toISOString().split("T")[0];
  };

  const calculateDays = (fromStr: string, untilStr: string): number | null => {
    if (!fromStr || !untilStr) return null;
    const from = new Date(fromStr);
    const until = new Date(untilStr);
    const diffTime = until.getTime() - from.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  const calculatedDays = calculateDays(neededFrom, neededUntil);

  // Keep daysInput in sync whenever calculatedDays changes
  useEffect(() => {
    if (calculatedDays !== null) {
      setDaysInput(String(calculatedDays));
    }
  }, [calculatedDays]);

  const setQuickDuration = (days: number) => {
    const start = neededFrom || getTodayString();
    setNeededFrom(start);
    setNeededUntil(addDaysToDate(start, days));
    setDaysInput(String(days));
  };

  const handleCustomDaysChange = (val: string) => {
    setDaysInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      const start = neededFrom || getTodayString();
      setNeededFrom(start);
      setNeededUntil(addDaysToDate(start, num));
    }
  };

  const handleDaysBlur = () => {
    if (!daysInput || parseInt(daysInput, 10) < 1) {
      if (calculatedDays) {
        setDaysInput(String(calculatedDays));
      } else {
        setDaysInput("");
      }
    }
  };

  const handleDaysStep = (delta: number) => {
    const current = calculatedDays || 1;
    const nextDays = Math.max(1, current + delta);
    setQuickDuration(nextDays);
  };

  const handleQuantityChange = (val: string) => {
    if (val === "") {
      setQuantity("");
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setQuantity(Math.max(1, num));
      }
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === "" || Number(quantity) < 1) {
      setQuantity(1);
    }
  };

  const handleQuantityStep = (delta: number) => {
    const current = typeof quantity === "number" ? quantity : parseInt(String(quantity), 10) || 1;
    setQuantity(Math.max(1, current + delta));
  };

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
              Item Category <span className="text-xs font-normal text-[var(--color-neutral-400)]">(optional)</span>
            </label>
            <p className="text-xs text-[var(--color-neutral-500)] mb-2">
              What kind of item is this? (e.g. <strong>Electronics</strong> for mic/speakers, <strong>Tools</strong> for drill/ladder, <strong>Books</strong> for notes). Neighbors use categories to find requests quickly.
            </p>
            <select
              id="wizard-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
            >
              <option value="">Select a category (optional)</option>
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

          {/* Dates & Duration row */}
          {typeConfig.hasDates && (
            <div className="space-y-3.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/60 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-bold text-[var(--color-neutral-900)] flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[var(--color-primary-600)]" />
                    How many days do you need this?
                  </span>
                  <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                    Click a quick duration or choose specific calendar dates below.
                  </p>
                </div>

                {calculatedDays !== null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs self-start sm:self-auto">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    {calculatedDays} {calculatedDays === 1 ? "Day" : "Days"} Total
                  </span>
                )}
              </div>

              {/* Quick Duration Buttons */}
              <div>
                <span className="text-[11px] font-semibold text-[var(--color-neutral-500)] uppercase tracking-wider block mb-1.5">
                  Quick Duration Presets:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "1 Day", days: 1 },
                    { label: "2 Days (Weekend)", days: 2 },
                    { label: "3 Days", days: 3 },
                    { label: "5 Days", days: 5 },
                    { label: "1 Week (7 Days)", days: 7 },
                    { label: "2 Weeks", days: 14 },
                  ].map((item) => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => setQuickDuration(item.days)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        calculatedDays === item.days
                          ? "bg-[var(--color-primary-600)] text-white shadow-2xs scale-105"
                          : "bg-white border border-[var(--color-neutral-300)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Custom Days Stepper & Input */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-xs font-semibold text-[var(--color-neutral-700)]">
                  Or type custom days:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDaysStep(-1)}
                    aria-label="Decrease days"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-neutral-300)] bg-white text-base font-bold text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] active:scale-95 transition-all cursor-pointer"
                  >
                    −
                  </button>

                  <div className="relative w-24">
                    <input
                      id="wizard-manual-days"
                      type="number"
                      min="1"
                      max="365"
                      placeholder="e.g. 4"
                      value={daysInput}
                      onChange={(e) => handleCustomDaysChange(e.target.value)}
                      onBlur={handleDaysBlur}
                      className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-1.5 px-3 text-center text-sm font-bold text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                    />
                  </div>

                  <span className="text-xs font-bold text-[var(--color-neutral-600)]">
                    {Number(daysInput) === 1 ? "Day" : "Days"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDaysStep(1)}
                    aria-label="Increase days"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-neutral-300)] bg-white text-base font-bold text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] active:scale-95 transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Date pickers row */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-[var(--color-neutral-200)]/60">
                <div>
                  <label
                    htmlFor="wizard-needed-from"
                    className="mb-1 block text-xs font-semibold text-[var(--color-neutral-700)]"
                  >
                    Needed From (Start Date)
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                    <input
                      id="wizard-needed-from"
                      type="date"
                      value={neededFrom}
                      onChange={(e) => setNeededFrom(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2 pl-9 pr-3 text-xs text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="wizard-needed-until"
                    className="mb-1 block text-xs font-semibold text-[var(--color-neutral-700)]"
                  >
                    Needed Until / Return By (End Date)
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                    <input
                      id="wizard-needed-until"
                      type="date"
                      value={neededUntil}
                      onChange={(e) => setNeededUntil(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2 pl-9 pr-3 text-xs text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                    />
                  </div>
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
            <p className="text-xs text-[var(--color-neutral-500)] mb-2.5">
              How many items do you need? Click a count or type any number directly:
            </p>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {[1, 2, 5, 10, 20, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    Number(quantity) === preset
                      ? "bg-[var(--color-primary-600)] text-white shadow-2xs scale-105"
                      : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Stepper + Direct Typing input */}
            <div className="flex items-center gap-2 max-w-[200px]">
              <button
                type="button"
                onClick={() => handleQuantityStep(-1)}
                aria-label="Decrease quantity"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-neutral-300)] bg-white text-base font-bold text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] active:scale-95 transition-all cursor-pointer"
              >
                −
              </button>

              <div className="relative flex-1">
                <input
                  id="wizard-quantity"
                  type="number"
                  min="1"
                  max="10000"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  onBlur={handleQuantityBlur}
                  className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2 px-3 text-center text-base font-bold text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                />
              </div>

              <button
                type="button"
                onClick={() => handleQuantityStep(1)}
                aria-label="Increase quantity"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-neutral-300)] bg-white text-base font-bold text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] active:scale-95 transition-all cursor-pointer"
              >
                +
              </button>
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
          <input type="hidden" name="quantity" value={Number(quantity) || 1} />
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
                        ? `${neededFrom} to ${neededUntil}${calculatedDays ? ` (${calculatedDays} ${calculatedDays === 1 ? "day" : "days"})` : ""}`
                        : neededFrom || neededUntil}
                    </strong>
                  </span>
                </div>
              )}

              {Number(quantity) > 1 && (
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Quantity: <strong>{Number(quantity) || 1}</strong>
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
