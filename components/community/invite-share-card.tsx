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

  const getJoinUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/join-community?code=${encodeURIComponent(inviteCode)}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      toast.success("Invite code copied! Neighbors can type this in 'Join Community'.");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy invite code.");
    }
  };

  const handleCopyLink = async () => {
    try {
      const joinUrl = getJoinUrl();
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      toast.success("Join link copied! Paste it in WhatsApp, Telegram, or SMS.");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy join link.");
    }
  };

  const handleWhatsAppShare = () => {
    const joinUrl = getJoinUrl();
    const message = encodeURIComponent(
      `Hey! Join our community "${communityName}" on Jod to borrow tools, share resources, and connect with neighbors:\n${joinUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  const handleNativeShare = async () => {
    const joinUrl = getJoinUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Join ${communityName} on Jod`,
          text: `Join our local community "${communityName}" on Jod!`,
          url: joinUrl,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--color-primary-600)]" />
          <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
            Invite Neighbors & Members
          </h2>
        </div>
        <span className="rounded-full bg-[var(--color-primary-50)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-primary-700)]">
          Private Community
        </span>
      </div>
      <p className="text-xs text-[var(--color-neutral-500)] mb-5">
        Only people with this secret invite code or link can join <strong>{communityName}</strong>.
      </p>

      {/* 2-Option Cards: Direct Link vs Passcode */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Option 1: Direct Link (Best for WhatsApp / Chats) */}
        <div className="flex flex-col justify-between rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)]/30 p-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-800)]">
                Direct Join Link
              </span>
              <span className="text-[10px] font-semibold text-[var(--color-primary-600)] bg-[var(--color-primary-100)]/80 px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>
            <p className="text-xs text-[var(--color-neutral-600)] mb-3">
              1-tap joining. Your neighbors won&apos;t need to manually type any code.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1 bg-white text-xs flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Option 2: Secret Code (For manual entry) */}
        <div className="flex flex-col justify-between rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-600)] block mb-1">
              Secret Invite Code
            </span>
            <p className="text-xs text-[var(--color-neutral-500)] mb-3">
              Give this code if someone is entering it manually on the Join page.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[var(--color-neutral-300)] bg-white px-3 py-2">
            <span className="font-mono text-sm font-bold tracking-wider text-[var(--color-neutral-900)]">
              {inviteCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy invite code"
              className="text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1 transition-colors ml-2"
            >
              {copiedCode ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
