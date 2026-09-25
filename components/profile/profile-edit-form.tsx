"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile";
import type { ProfileFormState } from "@/lib/validations/auth";
import type { Database } from "@/lib/types/database.types";
import { Loader2, Save, User, Phone, FileText, CheckCircle2, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileEditFormProps {
  profile: Profile;
}

/**
 * ProfileEditForm — client-side editable form for updating profile fields.
 * Uses useActionState for server action integration with progressive enhancement.
 * Shows Sonner toasts on success/failure.
 */
export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    undefined
  );

  // Show toasts when action state changes & refresh page data
  useEffect(() => {
    if (state?.success) {
      toast.success("Profile updated successfully.");
      router.refresh(); // Automatically fetches latest server data from database
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="space-y-6">
      {/* 🌟 NEXT STEP SUCCESS BANNER */}
      {state?.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-950 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-900">
                Profile Updated! Next: Connect with Your Community
              </h4>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                Your profile is now set up. To start borrowing tools, sharing resources, or posting needs, head over to your community dashboard.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                <Button asChild variant="primary" size="sm" className="gap-1.5 font-bold shadow-xs">
                  <Link href="/communities">
                    <Users className="h-3.5 w-3.5" />
                    Go to Communities
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5 bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100">
                  <Link href="/needs">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    View Needs Feed
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-[var(--color-neutral-900)]">
          Edit Profile
        </h3>
        <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">
          Update your display name, bio, and phone number.
        </p>

        <form action={action} className="mt-5 space-y-5" noValidate>
        {/* Display name */}
        <div>
          <label
            htmlFor="profile-display-name"
            className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
          >
            Display name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
            <input
              id="profile-display-name"
              name="display_name"
              type="text"
              autoComplete="name"
              defaultValue={profile.display_name}
              aria-describedby={
                state?.errors?.display_name
                  ? "profile-name-error"
                  : undefined
              }
              aria-invalid={!!state?.errors?.display_name}
              placeholder="Your name"
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
            />
          </div>
          {state?.errors?.display_name && (
            <p
              id="profile-name-error"
              role="alert"
              className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
            >
              {state.errors.display_name[0]}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="profile-bio"
            className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
          >
            Bio{" "}
            <span className="font-normal text-[var(--color-neutral-400)]">
              (optional)
            </span>
          </label>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--color-neutral-400)]" />
            <textarea
              id="profile-bio"
              name="bio"
              rows={3}
              defaultValue={profile.bio ?? ""}
              maxLength={500}
              aria-describedby={
                state?.errors?.bio ? "profile-bio-error" : undefined
              }
              aria-invalid={!!state?.errors?.bio}
              placeholder="Tell your community a bit about yourself…"
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)] resize-none"
            />
          </div>
          {state?.errors?.bio && (
            <p
              id="profile-bio-error"
              role="alert"
              className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
            >
              {state.errors.bio[0]}
            </p>
          )}
          <p className="mt-1 text-right text-xs text-[var(--color-neutral-400)]">
            Max 500 characters
          </p>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="profile-phone"
            className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-800)]"
          >
            Phone number{" "}
            <span className="font-normal text-[var(--color-neutral-400)]">
              (optional)
            </span>
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={profile.phone ?? ""}
              aria-describedby={
                state?.errors?.phone ? "profile-phone-error" : undefined
              }
              aria-invalid={!!state?.errors?.phone}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-[var(--color-neutral-300)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 aria-invalid:border-[hsl(0,70%,55%)]"
            />
          </div>
          {state?.errors?.phone && (
            <p
              id="profile-phone-error"
              role="alert"
              className="mt-1.5 text-xs text-[hsl(0,65%,45%)]"
            >
              {state.errors.phone[0]}
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
            Phone verification will be available in a future update.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end border-t border-[var(--color-neutral-100)] pt-5">
          <Button
            type="submit"
            variant="primary"
            disabled={pending}
            aria-disabled={pending}
            className="min-w-[120px]"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  </div>
  );
}
