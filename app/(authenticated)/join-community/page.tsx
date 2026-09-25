import type { Metadata } from "next";
import { JoinCommunityForm } from "@/components/community/join-community-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Join a Community — Jod",
  description: "Enter an invite code to join your local neighborhood, hostel, or workplace community on Jod.",
};

interface JoinCommunityPageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

export default async function JoinCommunityPage({
  searchParams,
}: JoinCommunityPageProps) {
  const { code } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Communities
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
          Join a Community
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Enter an invite code or token from your community admin or neighbor to join.
        </p>
      </div>

      {/* Card Form */}
      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-8 shadow-xs">
        <JoinCommunityForm defaultCode={code ?? ""} />
      </div>

      {/* Helper */}
      <p className="mt-6 text-center text-xs text-[var(--color-neutral-400)]">
        Want to start your own community instead?{" "}
        <Link
          href="/create-community"
          className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
        >
          Create a Community
        </Link>
      </p>
    </div>
  );
}
