"use client";

import { useActionState } from "react";
import { createCommunity } from "@/lib/actions/community";
import {
  COMMUNITY_TYPES,
  COMMUNITY_TYPE_LABELS,
  type CreateCommunityFormState,
} from "@/lib/validations/community";
import { AlertCircle, Loader2, Building2, Globe, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateCommunityForm() {
  const [state, action, pending] = useActionState<
    CreateCommunityFormState,
    FormData
  >(createCommunity, undefined);

  return (
    <form action={action} noValidate className="space-y-6">
      {/* General error message */}
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

      {/* Community Name */}
      <div>
        <label
          htmlFor="community-name"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Community Name <span className="text-[var(--color-primary-600)]">*</span>
        </label>
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            id="community-name"
            name="name"
            type="text"
            required
            aria-describedby={
              state?.errors?.name ? "community-name-error" : undefined
            }
            aria-invalid={!!state?.errors?.name}
            placeholder="e.g. Greenwood Apartments, IIT Campus, DLF Phase 5"
            className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
          />
        </div>
        {state?.errors?.name && (
          <p
            id="community-name-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.name[0]}
          </p>
        )}
      </div>

      {/* Community Type */}
      <div>
        <label
          htmlFor="community-type"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Community Type <span className="text-[var(--color-primary-600)]">*</span>
        </label>
        <select
          id="community-type"
          name="type"
          defaultValue="apartment"
          required
          aria-describedby={
            state?.errors?.type ? "community-type-error" : undefined
          }
          aria-invalid={!!state?.errors?.type}
          className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
        >
          {COMMUNITY_TYPES.map((typeKey) => (
            <option key={typeKey} value={typeKey}>
              {COMMUNITY_TYPE_LABELS[typeKey]}
            </option>
          ))}
        </select>
        {state?.errors?.type && (
          <p
            id="community-type-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.type[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="community-description"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Description{" "}
          <span className="font-normal text-[var(--color-neutral-400)]">
            (optional)
          </span>
        </label>
        <textarea
          id="community-description"
          name="description"
          rows={3}
          maxLength={1000}
          aria-describedby={
            state?.errors?.description ? "community-desc-error" : undefined
          }
          aria-invalid={!!state?.errors?.description}
          placeholder="Briefly describe your community, landmarks, or guidelines for members…"
          className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 px-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)] resize-none"
        />
        {state?.errors?.description && (
          <p
            id="community-desc-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4">
        <span className="text-sm font-semibold text-[var(--color-neutral-900)] block mb-3">
          Privacy Settings
        </span>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="is_private"
              value="true"
              defaultChecked
              className="mt-1 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
            />
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-800)]">
                <Lock className="h-3.5 w-3.5 text-[var(--color-neutral-600)]" />
                Private (Recommended)
              </div>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Only invited members with the invite code can view listings and join.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="is_private"
              value="false"
              className="mt-1 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
            />
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-800)]">
                <Globe className="h-3.5 w-3.5 text-[var(--color-neutral-600)]" />
                Public
              </div>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Visible in local search, but users must still join to create needs and offers.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--color-neutral-500)]">
        <Info className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
        <span>
          As the creator, you will automatically be assigned as the{" "}
          <strong className="text-[var(--color-neutral-700)]">Owner</strong> of this community.
        </span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={pending}
        aria-disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Community…
          </>
        ) : (
          "Create Community"
        )}
      </Button>
    </form>
  );
}
