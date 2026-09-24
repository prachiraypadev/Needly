import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Phone,
  CheckCircle2,
  XCircle,
  Building2,
  ShoppingBag,
  Package,
  Users,
  ExternalLink,
  Plus,
  KeyRound,
  Shield,
  ArrowRight,
} from "lucide-react";
import type { Database } from "@/lib/types/database.types";
import type { UserCommunityItem } from "@/lib/community/dal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteCommunityButton } from "@/components/community/delete-community-button";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileViewProps {
  profile: Profile;
  communities: UserCommunityItem[];
  stats: {
    needsCount: number;
    listingsCount: number;
  };
}

export function ProfileView({ profile, communities, stats }: ProfileViewProps) {
  const isPhoneVerified = !!profile.phone_verified_at;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });

  const isFounderOrAdmin = communities.some(
    (c) => c.role === "admin" || c.role === "owner"
  );

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar name={profile.display_name} size="lg" className="h-16 w-16 text-lg ring-4 ring-[var(--color-primary-50)]" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--color-neutral-900)] truncate">
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
                {isFounderOrAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary-700)]">
                    <Shield className="h-3 w-3 text-[var(--color-primary-600)]" />
                    Community Founder
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                Member since {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Bio & Phone row */}
        <div className="mt-5 pt-5 border-t border-[var(--color-neutral-100)] grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)] block mb-1">
              About / Bio
            </span>
            <p className="text-sm text-[var(--color-neutral-700)] leading-relaxed">
              {profile.bio || (
                <span className="italic text-[var(--color-neutral-400)]">
                  No bio added yet. Tell your neighbors about yourself!
                </span>
              )}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)] block mb-1">
              Contact & Trust
            </span>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[var(--color-neutral-400)]" />
              <span className="text-sm font-medium text-[var(--color-neutral-800)]">
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
        </div>
      </div>

      {/* Activity & Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/communities"
          className="group rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 transition-all hover:border-[var(--color-primary-300)] hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-[var(--color-neutral-500)] mb-1">
            <span className="text-xs font-medium group-hover:text-[var(--color-primary-700)]">
              Communities
            </span>
            <Users className="h-4 w-4 text-[var(--color-neutral-400)] group-hover:text-[var(--color-primary-600)]" />
          </div>
          <div className="text-2xl font-black text-[var(--color-neutral-900)]">
            {communities.length}
          </div>
          <span className="text-[11px] text-[var(--color-neutral-400)]">Joined societies</span>
        </Link>

        <Link
          href="/needs?view=my-needs"
          className="group rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 transition-all hover:border-[var(--color-primary-300)] hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-[var(--color-neutral-500)] mb-1">
            <span className="text-xs font-medium group-hover:text-[var(--color-primary-700)]">
              My Needs
            </span>
            <ShoppingBag className="h-4 w-4 text-[var(--color-neutral-400)] group-hover:text-[var(--color-primary-600)]" />
          </div>
          <div className="text-2xl font-black text-[var(--color-neutral-900)]">
            {stats.needsCount}
          </div>
          <span className="text-[11px] text-[var(--color-neutral-400)]">Requests created by you</span>
        </Link>

        <Link
          href="/my-listings"
          className="group rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 transition-all hover:border-[var(--color-primary-300)] hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-[var(--color-neutral-500)] mb-1">
            <span className="text-xs font-medium group-hover:text-[var(--color-primary-700)]">
              Shared Items
            </span>
            <Package className="h-4 w-4 text-[var(--color-neutral-400)] group-hover:text-[var(--color-primary-600)]" />
          </div>
          <div className="text-2xl font-black text-[var(--color-neutral-900)]">
            {stats.listingsCount}
          </div>
          <span className="text-[11px] text-[var(--color-neutral-400)]">Items & services shared</span>
        </Link>
      </div>

      {/* My Communities Section */}
      <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--color-primary-600)]" />
            <h3 className="text-base font-bold text-[var(--color-neutral-900)]">
              My Communities
            </h3>
            <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs font-semibold text-[var(--color-neutral-700)]">
              {communities.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/join-community" className="flex items-center gap-1">
                <KeyRound className="h-3 w-3" />
                Join
              </Link>
            </Button>
            <Button asChild variant="primary" size="sm" className="text-xs">
              <Link href="/create-community" className="flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Create Society
              </Link>
            </Button>
          </div>
        </div>

        {communities.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-[var(--color-neutral-200)] rounded-xl">
            <p className="text-sm text-[var(--color-neutral-500)]">
              You haven&apos;t joined any community yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {communities.map((comm) => (
              <div
                key={comm.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold text-sm">
                    {comm.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/communities/${comm.id}`}
                        className="text-sm font-bold text-[var(--color-neutral-900)] hover:text-[var(--color-primary-600)] transition-colors"
                      >
                        {comm.name}
                      </Link>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {comm.role}
                      </Badge>
                      <span className="text-[11px] text-[var(--color-neutral-400)] capitalize">
                        • {comm.type}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                      {comm.member_count} {comm.member_count === 1 ? "neighbor" : "neighbors"}
                      {comm.description ? ` • ${comm.description}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
                    <Link href={`/communities/${comm.id}`} className="flex items-center gap-1.5">
                      <span>Enter Community</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                  {(comm.role === "owner" || comm.role === "admin") && (
                    <DeleteCommunityButton
                      communityId={comm.id}
                      communityName={comm.name}
                      variant="icon"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
