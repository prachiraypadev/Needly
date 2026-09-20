"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface CommunitySwitcherProps {
  communities: Array<{ id: string; name: string }>;
  activeCommunityId?: string;
  basePath: string; // e.g. "/needs" or "/listings"
}

/**
 * CommunitySwitcher — Client component for switching active community in feeds.
 * Uses Next.js client router with preserved URL query parameters.
 */
export function CommunitySwitcher({
  communities,
  activeCommunityId,
  basePath,
}: CommunitySwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCommunityId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("community", newCommunityId);
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <select
      value={activeCommunityId}
      onChange={handleChange}
      aria-label="Select active community"
      className="rounded-md border border-[var(--color-neutral-300)] bg-white py-1 px-2.5 text-sm font-semibold text-[var(--color-neutral-900)] focus:border-[var(--color-primary-500)] focus:outline-none cursor-pointer hover:border-[var(--color-neutral-400)] transition-colors"
    >
      {communities.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
