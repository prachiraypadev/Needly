"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Share2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteShareCardProps {
  inviteCode: string | null;
  communityName: string;
}

export function InviteShareCard({
  inviteCode,
  communityName,
}: InviteShareCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!inviteCode) {
    return null;
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      toast.success("Invite code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy invite code.");
    }
  };

  const handleCopyLink = async () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const joinUrl = `${origin}/join-community?code=${encodeURIComponent(inviteCode)}`;
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      toast.success("Join link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy join link.");
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound className="h-4 w-4 text-[var(--color-primary-600)]" />
        <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
          Invite Neighbors & Members
        </h2>
      </div>
      <p className="text-xs text-[var(--color-neutral-500)] mb-4">
        Share this invite code or direct link with verified members of {communityName}.
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Code display */}
        <div className="flex-1 flex items-center justify-between rounded-lg border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] px-3.5 py-2.5">
          <span className="font-mono text-sm font-bold tracking-widest text-[var(--color-neutral-900)]">
            {inviteCode}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            aria-label="Copy invite code"
            className="text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1 transition-colors"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Copy full link button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleCopyLink}
          className="shrink-0 text-xs flex items-center gap-1.5"
        >
          {copiedLink ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              <span>Copy Invite Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
