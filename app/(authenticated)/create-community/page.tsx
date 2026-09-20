import type { Metadata } from "next";
import { CreateCommunityForm } from "@/components/community/create-community-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Create a Community — Jod",
  description: "Create a new verified community for your apartment, college, or workplace on Jod.",
};

export default function CreateCommunityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
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
          Create a Community
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Start a private, trusted sharing network for your neighborhood, society, hostel, or workplace.
        </p>
      </div>

      {/* Card Form */}
      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-8 shadow-xs">
        <CreateCommunityForm />
      </div>
    </div>
  );
}
