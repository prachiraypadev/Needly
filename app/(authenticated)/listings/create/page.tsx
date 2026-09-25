import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getUserCommunities } from "@/lib/community/dal";
import { getCategories } from "@/lib/db/listings";
import { CreateListingWizard } from "@/components/listings/create-listing-wizard";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offer an Item or Service — Jod",
  description: "Share, rent, or sell items and offer local services within your verified community on Jod.",
};

interface CreateListingPageProps {
  searchParams: Promise<{
    community?: string;
  }>;
}

export default async function CreateListingPage({
  searchParams,
}: CreateListingPageProps) {
  const { userId } = await verifySession();
  const { community: communityParam } = await searchParams;

  const [userCommunities, categories] = await Promise.all([
    getUserCommunities(userId),
    getCategories(),
  ]);

  if (userCommunities.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
          Join a Community First
        </h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)] max-w-md mx-auto">
          Jod is community-first. You must be an active member of an apartment, hostel, or neighborhood community before offering items or services.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/join-community">Join via Invite Code</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/create-community">Create a Community</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Listings Feed
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
          Offer an Item or Service
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Lend tools, rent equipment, sell unused items, or offer your skills to verified neighbors.
        </p>
      </div>

      {/* Creation Wizard Card */}
      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-8 shadow-xs">
        <CreateListingWizard
          communities={userCommunities.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          }))}
          categories={categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
          }))}
          initialCommunityId={communityParam}
        />
      </div>
    </div>
  );
}
