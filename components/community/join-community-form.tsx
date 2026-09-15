"use client";

import { useActionState } from "react";
import { joinCommunity } from "@/lib/actions/community";
import type { JoinCommunityFormState } from "@/lib/validations/community";
import { AlertCircle, Loader2, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JoinCommunityFormProps {
  defaultCode?: string;
}

export function JoinCommunityForm({ defaultCode = "" }: JoinCommunityFormProps) {
  const [state, action, pending] = useActionState<
    JoinCommunityFormState,
    FormData
  >(joinCommunity, undefined);

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

      {/* Invite Code Input */}
      <div>
        <label
          htmlFor="invite-code"
          className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
        >
          Community Invite Code / Token
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            id="invite-code"
            name="invite_code"
            type="text"
            required
            defaultValue={defaultCode}
            aria-describedby={
              state?.errors?.invite_code ? "invite-code-error" : "invite-code-hint"
            }
            aria-invalid={!!state?.errors?.invite_code}
            placeholder="e.g. NEED-8X7K or inv_a1b2c3d4..."
            className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 font-mono text-sm tracking-wider uppercase text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] placeholder:normal-case placeholder:font-sans focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
          />
        </div>
        {state?.errors?.invite_code ? (
          <p
            id="invite-code-error"
            role="alert"
            className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
          >
            {state.errors.invite_code[0]}
          </p>
        ) : (
          <p
            id="invite-code-hint"
            className="mt-1.5 text-xs text-[var(--color-neutral-500)]"
          >
            Ask your apartment manager, community admin, or neighbor for the invite code.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[var(--color-primary-600)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-neutral-600)] leading-relaxed">
          Joining a community grants you verified access to view local listings, borrow items, and post needs within that closed group.
        </p>
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
            Verifying Code & Joining…
          </>
        ) : (
          <>
            Join Community
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
