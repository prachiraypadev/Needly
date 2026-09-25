"use client";

import React, { useState } from "react";
import {
  Bell,
  Shield,
  User,
  Mail,
  CheckCircle2,
  Lock,
  Smartphone,
  Sparkles,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsViewProps {
  email?: string;
  displayName: string;
}

export function SettingsView({ email, displayName }: SettingsViewProps) {
  // Notification states
  const [notifyNeeds, setNotifyNeeds] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);

  // Privacy states
  const [showPhoneOnlyToMembers, setShowPhoneOnlyToMembers] = useState(true);
  const [showRoomToCommunity, setShowRoomToCommunity] = useState(true);

  // Saved feedback toast
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-4 py-3 text-sm font-semibold text-[var(--color-primary-800)] shadow-xs animate-in fade-in duration-200"
        >
          <CheckCircle2 className="h-4 w-4 text-[var(--color-primary-600)] shrink-0" />
          <span>Your preferences have been saved successfully!</span>
        </div>
      )}

      {/* 1. NOTIFICATIONS SETTINGS */}
      <section className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--color-neutral-100)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-neutral-900)]">
              Notification Preferences
            </h2>
            <p className="text-xs text-[var(--color-neutral-500)]">
              Choose how you want to be alerted about community activity.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Item 1: Community Needs */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <label
                htmlFor="notify-needs"
                className="text-sm font-semibold text-[var(--color-neutral-800)] cursor-pointer"
              >
                New Need Requests in My Community
              </label>
              <p className="text-xs text-[var(--color-neutral-500)] leading-relaxed">
                Get notified when neighbors in your hostel or apartment post a request for items or help.
              </p>
            </div>
            <input
              id="notify-needs"
              type="checkbox"
              checked={notifyNeeds}
              onChange={(e) => setNotifyNeeds(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer accent-[var(--color-primary-600)]"
            />
          </div>

          {/* Item 2: Responses & Offers */}
          <div className="flex items-start justify-between gap-4 pt-3 border-t border-[var(--color-neutral-100)]">
            <div className="space-y-0.5">
              <label
                htmlFor="notify-offers"
                className="text-sm font-semibold text-[var(--color-neutral-800)] cursor-pointer"
              >
                Responses & Fulfillments
              </label>
              <p className="text-xs text-[var(--color-neutral-500)] leading-relaxed">
                Receive instant alerts when a neighbor offers an item or responds to your active need.
              </p>
            </div>
            <input
              id="notify-offers"
              type="checkbox"
              checked={notifyOffers}
              onChange={(e) => setNotifyOffers(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer accent-[var(--color-primary-600)]"
            />
          </div>

          {/* Item 3: Weekly Digest */}
          <div className="flex items-start justify-between gap-4 pt-3 border-t border-[var(--color-neutral-100)]">
            <div className="space-y-0.5">
              <label
                htmlFor="notify-digest"
                className="text-sm font-semibold text-[var(--color-neutral-800)] cursor-pointer"
              >
                Weekly Neighborhood Summary
              </label>
              <p className="text-xs text-[var(--color-neutral-500)] leading-relaxed">
                A weekend recap of top shared items, resolved needs, and new community members.
              </p>
            </div>
            <input
              id="notify-digest"
              type="checkbox"
              checked={notifyDigest}
              onChange={(e) => setNotifyDigest(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer accent-[var(--color-primary-600)]"
            />
          </div>
        </div>
      </section>

      {/* 2. PRIVACY & TRUST SETTINGS */}
      <section className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--color-neutral-100)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-neutral-900)]">
              Privacy & Trust Boundary
            </h2>
            <p className="text-xs text-[var(--color-neutral-500)]">
              Control what verified community members can see.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Item 1: Phone visibility */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <label
                htmlFor="privacy-phone"
                className="text-sm font-semibold text-[var(--color-neutral-800)] cursor-pointer"
              >
                Limit Phone Contact to Community Members
              </label>
              <p className="text-xs text-[var(--color-neutral-500)] leading-relaxed">
                Only verified members of your shared societies can see your phone for coordinating pickups.
              </p>
            </div>
            <input
              id="privacy-phone"
              type="checkbox"
              checked={showPhoneOnlyToMembers}
              onChange={(e) => setShowPhoneOnlyToMembers(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer accent-[var(--color-primary-600)]"
            />
          </div>

          {/* Item 2: Flat / Room visibility */}
          <div className="flex items-start justify-between gap-4 pt-3 border-t border-[var(--color-neutral-100)]">
            <div className="space-y-0.5">
              <label
                htmlFor="privacy-room"
                className="text-sm font-semibold text-[var(--color-neutral-800)] cursor-pointer"
              >
                Allow Room / Flat Pickup Notes
              </label>
              <p className="text-xs text-[var(--color-neutral-500)] leading-relaxed">
                Enables pickup hints in your offerings so neighbors know which wing or room to visit.
              </p>
            </div>
            <input
              id="privacy-room"
              type="checkbox"
              checked={showRoomToCommunity}
              onChange={(e) => setShowRoomToCommunity(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer accent-[var(--color-primary-600)]"
            />
          </div>
        </div>
      </section>

      {/* 3. ACCOUNT INFO */}
      <section className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--color-neutral-100)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-neutral-900)]">
              Account Information
            </h2>
            <p className="text-xs text-[var(--color-neutral-500)]">
              Your registered Jod account identity.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3">
            <span className="font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider block mb-0.5 text-[10px]">
              Display Name
            </span>
            <span className="text-sm font-bold text-[var(--color-neutral-800)]">
              {displayName}
            </span>
          </div>

          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3">
            <span className="font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider block mb-0.5 text-[10px]">
              Registered Email
            </span>
            <span className="text-sm font-bold text-[var(--color-neutral-800)] truncate block">
              {email || "Not specified"}
            </span>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={handleSave}
          variant="primary"
          size="lg"
          className="gap-2 shadow-xs min-w-[160px]"
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
