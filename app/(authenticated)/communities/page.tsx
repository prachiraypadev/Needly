import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getUserCommunities } from "@/lib/community/dal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  COMMUNITY_TYPE_LABELS,
  type CommunityType,
} from "@/lib/validations/community";
import Link from "next/link";
import {
  Building2,
  Plus,
  ArrowRight,
  Shield,
  Crown,
  KeyRound,
  Lock,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "My Communities — Needly",
  description: "View and manage the local communities you belong to on Needly.",
};

export default async function CommunitiesPage() {
  const { userId } = await verifySession();
  const communities = await getUserCommunities(userId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            My Communities
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Needly is community-first. All your local borrowing, lending, and requests happen within these groups.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href="/join-community" className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              Join Community
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/create-community" className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Community
            </Link>
          </Button>
        </div>
      </div>

      {/* Communities List / Empty State */}
      {communities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-neutral-300)] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
            You haven&apos;t joined any communities yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--color-neutral-500)]">
            Needly connects you with people in your apartment, college campus, or neighborhood. Join an existing community with an invite code or create a new one.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/join-community">Enter Invite Code</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/create-community">Create a Community</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((comm) => {
            const typeLabel =
              COMMUNITY_TYPE_LABELS[comm.type as CommunityType] ?? comm.type;

            const isOwner = comm.role === "owner";
            const isAdmin = comm.role === "admin";

            return (
              <Link
                key={comm.id}
                href={`/communities/${comm.id}`}
                className="group flex flex-col justify-between rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xs transition-all hover:border-[var(--color-primary-500)]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="default" className="text-[11px]">
                      <Building2 className="mr-1 h-3 w-3" />
                      {typeLabel}
                    </Badge>

                    {isOwner ? (
                      <Badge variant="primary" className="text-[11px]">
                        <Crown className="mr-1 h-3 w-3" />
                        Owner
                      </Badge>
                    ) : isAdmin ? (
                      <Badge variant="primary" className="text-[11px]">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px]">
                        Member
                      </Badge>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-base font-bold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors">
                    {comm.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--color-neutral-500)] leading-relaxed">
                    {comm.description || "No description provided."}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-[var(--color-neutral-100)] pt-3 text-xs text-[var(--color-neutral-400)]">
                  <div className="flex items-center gap-1.5">
                    {comm.is_private ? (
                      <span className="flex items-center gap-1 text-[var(--color-neutral-500)]">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[var(--color-neutral-500)]">
                        <Globe className="h-3 w-3" />
                        Public
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-1 font-semibold text-[var(--color-primary-600)] group-hover:translate-x-0.5 transition-transform">
                    Enter <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
