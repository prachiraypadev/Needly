import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Phone, CheckCircle2, XCircle } from "lucide-react";
import type { Database } from "@/lib/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileViewProps {
  profile: Profile;
}

/**
 * ProfileView — Read-only display of a user's profile information.
 * Shows avatar (initials fallback), display name, bio, phone verification
 * status, and account active status.
 */
export function ProfileView({ profile }: ProfileViewProps) {
  const isPhoneVerified = !!profile.phone_verified_at;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs">
      {/* Avatar + Identity row */}
      <div className="flex items-start gap-4">
        <Avatar name={profile.display_name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] truncate">
              {profile.display_name}
            </h2>
            {profile.is_active ? (
              <Badge variant="success">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline">
                <XCircle className="mr-1 h-3 w-3" />
                Inactive
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-[var(--color-neutral-100)]" />

      {/* Bio */}
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-400)]">
          Bio
        </span>
        <p className="mt-1.5 text-sm text-[var(--color-neutral-700)] leading-relaxed">
          {profile.bio || (
            <span className="italic text-[var(--color-neutral-400)]">
              No bio added yet.
            </span>
          )}
        </p>
      </div>

      {/* Phone verification status */}
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-[var(--color-neutral-400)]" />
        <span className="text-sm text-[var(--color-neutral-600)]">
          {profile.phone || "No phone number added"}
        </span>
        {profile.phone && (
          <>
            {isPhoneVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-light,hsl(152,50%,90%))] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-success,hsl(152,50%,30%))]">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-neutral-500)]">
                Not verified
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
