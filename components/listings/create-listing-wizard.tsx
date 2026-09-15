"use client";

import { useState, useActionState } from "react";
import { createListing } from "@/lib/actions/listings";
import {
  ITEM_TRANSACTION_TYPES,
  TRANSACTION_TYPE_CONFIG,
  ITEM_CONDITIONS,
  ITEM_CONDITION_LABELS,
  DAYS_OF_WEEK,
  type ListingType,
  type TransactionType,
  type PriceUnit,
  type ItemCondition,
  type CreateListingFormState,
} from "@/lib/validations/listing";
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
  Package,
  Wrench,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";

interface CreateListingWizardProps {
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

export function CreateListingWizard({
  communities,
  categories,
  initialCommunityId,
}: CreateListingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [listingType, setListingType] = useState<ListingType>("item");
  const [title, setTitle] = useState("");
  const [communityId, setCommunityId] = useState(
    initialCommunityId || (communities[0]?.id ?? "")
  );
  const [transactionType, setTransactionType] = useState<TransactionType>("lend");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("per_day");
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<ItemCondition>("good");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  // Media URLs
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState("");

  // Recurring Availability Slots
  const [availabilitySlots, setAvailabilitySlots] = useState<
    Array<{ day_of_week: number; time_from: string; time_to: string }>
  >([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [timeFrom, setTimeFrom] = useState("09:00");
  const [timeTo, setTimeTo] = useState("18:00");

  const [state, action, pending] = useActionState<
    CreateListingFormState,
    FormData
  >(createListing, undefined);

  const selectedCommunity = communities.find((c) => c.id === communityId);
  const selectedCategoryName = categoryId
    ? (categories.find((c) => c.id === categoryId)?.name ?? categoryId)
    : undefined;

  // Handle switching between Item and Service
  const handleSelectListingType = (type: ListingType) => {
    setListingType(type);
    if (type === "service") {
      setTransactionType("service");
      setPriceUnit("per_hour");
    } else {
      setTransactionType("lend");
      setPriceUnit("per_day");
    }
  };

  const handleAddMediaUrl = () => {
    if (inputUrl.trim() && (inputUrl.startsWith("http://") || inputUrl.startsWith("https://"))) {
      setMediaUrls((prev) => [...prev, inputUrl.trim()]);
      setInputUrl("");
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSlot = () => {
    if (timeFrom < timeTo) {
      if (!availabilitySlots.some((s) => s.day_of_week === selectedDay)) {
        setAvailabilitySlots((prev) => [
          ...prev,
          { day_of_week: selectedDay, time_from: timeFrom, time_to: timeTo },
        ]);
      }
    }
  };

  const handleRemoveSlot = (day: number) => {
    setAvailabilitySlots((prev) => prev.filter((s) => s.day_of_week !== day));
  };

  const canAdvanceStep1 = title.trim().length >= 3 && !!communityId;
  const canAdvanceStep2 =
    listingType === "service" ||
    (transactionType === "lend"
      ? true
      : transactionType === "sell"
      ? Number(priceAmount) > 0
      : Number(priceAmount) > 0 && !!priceUnit);

  return (
    <div className="space-y-6">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-xs font-bold text-white">
            {step}
          </span>
          <span className="text-sm font-semibold text-[var(--color-neutral-900)]">
            {step === 1 && "What are you offering?"}
            {step === 2 && "Transaction & Pricing"}
            {step === 3 && "Details & Availability"}
            {step === 4 && "Review & Publish"}
          </span>
        </div>
        <span className="text-xs text-[var(--color-neutral-400)]">
          Step {step} of 4
        </span>
      </div>

      {/* Global Server Action Error Banner */}
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

      {/* STEP 1: What are you offering? */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Item vs Service Choice */}
          <div>
            <span className="mb-2 block text-sm font-medium text-[var(--color-neutral-800)]">
              Offering Type <span className="text-[var(--color-primary-600)]">*</span>
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleSelectListingType("item")}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  listingType === "item"
                    ? "border-[var(--color-primary-600)] bg-[var(--color-primary-50)]/40 shadow-xs"
                    : "border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary-700)] shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-neutral-900)]">
                    Item / Physical Good
                  </h4>
                  <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                    Lend, rent, or sell tools, ladder, books, projector, chairs, etc.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectListingType("service")}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  listingType === "service"
                    ? "border-[var(--color-primary-600)] bg-[var(--color-primary-50)]/40 shadow-xs"
                    : "border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary-700)] shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-neutral-900)]">
                    Service / Skill
                  </h4>
                  <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                    Offer help, electric repair, plumbing, carpentry, tutoring, or tasks.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Community Selector */}
          <div>
            <label
              htmlFor="wizard-community"
              className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
            >
              Offer to Community <span className="text-[var(--color-primary-600)]">*</span>
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
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="wizard-title"
              className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
            >
              {listingType === "item" ? "Item Title" : "Service Title"}{" "}
              <span className="text-[var(--color-primary-600)]">*</span>
            </label>
            <input
              id="wizard-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                listingType === "item"
                  ? "e.g. Bosch Hammer Drill 650W with Bits, 6-Step Aluminum Ladder"
                  : "e.g. Home Electrician & Appliance Repair, Math Tutoring for Grade 8-10"
              }
              autoFocus
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-3 px-3.5 text-base text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
            />
            {state?.errors?.title && (
              <p className="mt-1 text-xs text-[hsl(0,65%,45%)]">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--color-neutral-100)]">
            <Button
              type="button"
              variant="primary"
              disabled={!canAdvanceStep1}
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Transaction & Pricing */}
      {step === 2 && (
        <div className="space-y-5">
          {/* If Item: Select Lend, Rent, or Sell */}
          {listingType === "item" ? (
            <div>
              <span className="mb-2 block text-sm font-medium text-[var(--color-neutral-800)]">
                Transaction Mode <span className="text-[var(--color-primary-600)]">*</span>
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
                {ITEM_TRANSACTION_TYPES.map((tType) => {
                  const cfg = TRANSACTION_TYPE_CONFIG[tType];
                  const isSelected = transactionType === tType;

                  return (
                    <button
                      key={tType}
                      type="button"
                      onClick={() => {
                        setTransactionType(tType);
                        if (tType === "lend") {
                          setPriceAmount("");
                        } else if (tType === "sell") {
                          setPriceUnit("fixed");
                        } else if (tType === "rent") {
                          setPriceUnit("per_day");
                        }
                      }}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--color-primary-600)] bg-[var(--color-primary-50)]/40 shadow-xs"
                          : "border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={cfg.badgeVariant} className="text-xs">
                          {cfg.shortLabel}
                        </Badge>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-primary-600)]" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[var(--color-neutral-900)]">
                        {cfg.label}
                      </h4>
                      <p className="text-[11px] text-[var(--color-neutral-500)] mt-1">
                        {cfg.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[var(--color-primary-50)]/40 border border-[var(--color-primary-200)] p-3 text-xs text-[var(--color-primary-800)] flex items-center gap-2">
              <Wrench className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
              <span>
                Offering as a <strong>Service</strong>. Set your hourly or fixed rate below.
              </span>
            </div>
          )}

          {/* Pricing Row if Rent, Sell, or Service */}
          {(transactionType === "rent" ||
            transactionType === "sell" ||
            listingType === "service") && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="wizard-price-amount"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
                >
                  Price Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                  <input
                    id="wizard-price-amount"
                    type="number"
                    min="0"
                    placeholder="e.g. 150"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="wizard-price-unit"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
                >
                  Pricing Unit
                </label>
                <select
                  id="wizard-price-unit"
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}
                  className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none"
                >
                  {transactionType === "rent" && (
                    <>
                      <option value="per_day">per day</option>
                      <option value="per_hour">per hour</option>
                    </>
                  )}
                  {transactionType === "sell" && (
                    <>
                      <option value="fixed">Fixed Price</option>
                      <option value="negotiable">Negotiable</option>
                    </>
                  )}
                  {listingType === "service" && (
                    <>
                      <option value="per_hour">per hour</option>
                      <option value="fixed">Fixed per job</option>
                      <option value="negotiable">Negotiable</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Condition & Quantity for Items */}
          {listingType === "item" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="wizard-condition"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
                >
                  Item Condition
                </label>
                <select
                  id="wizard-condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none"
                >
                  {ITEM_CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {ITEM_CONDITION_LABELS[cond].label} — {ITEM_CONDITION_LABELS[cond].description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="wizard-quantity"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
                >
                  Available Quantity
                </label>
                <div className="relative">
                  <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                  <input
                    id="wizard-quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

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
            <Button
              type="button"
              variant="primary"
              disabled={!canAdvanceStep2}
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Details, Media & Availability */}
      {step === 3 && (
        <div className="space-y-5">
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
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none"
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
              Description & Notes
            </label>
            <textarea
              id="wizard-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item condition, usage notes, model, or your service background…"
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none resize-none"
            />
          </div>

          {/* Photos / Media URLs */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]">
              Photo URL <span className="text-xs font-normal text-[var(--color-neutral-400)]">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 rounded-lg border border-[var(--color-neutral-300)] bg-white py-2 px-3 text-xs text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMediaUrl}
                className="shrink-0 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Photo
              </Button>
            </div>

            {mediaUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {mediaUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative group h-16 w-20 rounded-md border border-[var(--color-neutral-200)] overflow-hidden bg-[var(--color-neutral-100)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMediaUrl(i)}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-80 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recurring Weekly Availability */}
          <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-neutral-900)]">
              <Clock className="h-4 w-4 text-[var(--color-primary-600)]" />
              <span>Weekly Availability Schedule (Optional)</span>
            </div>
            <p className="text-xs text-[var(--color-neutral-500)]">
              Specify days and hours when you are available for pickups or service appointments.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                aria-label="Day of week"
                className="rounded-md border border-[var(--color-neutral-300)] bg-white py-1.5 px-2.5 text-xs text-[var(--color-neutral-800)]"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                aria-label="Start time"
                className="rounded-md border border-[var(--color-neutral-300)] bg-white py-1 px-2 text-xs text-[var(--color-neutral-800)]"
              />
              <span className="text-xs text-[var(--color-neutral-400)]">to</span>
              <input
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                aria-label="End time"
                className="rounded-md border border-[var(--color-neutral-300)] bg-white py-1 px-2 text-xs text-[var(--color-neutral-800)]"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSlot}
                className="text-xs h-7 px-2.5"
              >
                Add Slot
              </Button>
            </div>

            {availabilitySlots.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {availabilitySlots.map((slot) => {
                  const dayLabel = DAYS_OF_WEEK.find((d) => d.value === slot.day_of_week)?.short;
                  return (
                    <span
                      key={slot.day_of_week}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[var(--color-neutral-200)] px-2.5 py-1 text-xs text-[var(--color-neutral-700)] shadow-2xs"
                    >
                      <strong>{dayLabel}:</strong> {slot.time_from} – {slot.time_to}
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slot.day_of_week)}
                        aria-label={`Remove ${dayLabel} availability`}
                        className="text-[var(--color-neutral-400)] hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
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
              type="button"
              variant="primary"
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5"
            >
              Review Offering
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Publish */}
      {step === 4 && (
        <form action={action} className="space-y-6">
          <input type="hidden" name="listing_type" value={listingType} />
          <input type="hidden" name="transaction_type" value={transactionType} />
          <input type="hidden" name="community_id" value={communityId} />
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="price_amount" value={priceAmount} />
          <input type="hidden" name="price_unit" value={priceUnit} />
          <input type="hidden" name="quantity" value={quantity} />
          <input type="hidden" name="condition" value={listingType === "item" ? condition : ""} />
          <input type="hidden" name="media_urls" value={JSON.stringify(mediaUrls)} />
          <input type="hidden" name="availability_slots" value={JSON.stringify(availabilitySlots)} />

          {/* Live Preview Card */}
          <div className="rounded-xl border-2 border-[var(--color-primary-300)] bg-[var(--color-primary-50)]/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-700)] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Preview of your Offering
              </span>
              <Badge variant={TRANSACTION_TYPE_CONFIG[transactionType].badgeVariant} className="text-xs">
                {TRANSACTION_TYPE_CONFIG[transactionType].label}
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
                  Community: <strong>{selectedCommunity?.name}</strong>
                </span>
              </div>

              {priceAmount ? (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Price: <strong>₹{priceAmount} {priceUnit ? `(${priceUnit.replace("_", " ")})` : ""}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Price: <strong>Free to Borrow</strong>
                  </span>
                </div>
              )}

              {listingType === "item" && (
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Condition: <strong>{ITEM_CONDITION_LABELS[condition].label}</strong> | Qty: <strong>{quantity}</strong>
                  </span>
                </div>
              )}

              {availabilitySlots.length > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Availability: <strong>{availabilitySlots.length} weekly slots configured</strong>
                  </span>
                </div>
              )}

              {selectedCategoryName && (
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-[var(--color-neutral-500)]" />
                  <span>
                    Category: <strong>{selectedCategoryName}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

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
                  Publishing Offering…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Publish Listing
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
