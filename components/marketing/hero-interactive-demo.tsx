"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react";

interface Offer {
  id: string;
  name: string;
  unit: string;
  item: string;
  status: string;
  avatarColor: string;
}

const OFFERS: Offer[] = [
  {
    id: "priya",
    name: "Priya P.",
    unit: "Block C-101",
    item: "Bosch 18V Hammer Drill available",
    status: "Free to lend",
    avatarColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "amit",
    name: "Amit V.",
    unit: "Block A-204",
    item: "Cordless drill + 20 drill bits set",
    status: "Free to lend",
    avatarColor: "bg-blue-100 text-blue-700",
  },
];

export function HeroInteractiveDemo() {
  const [selectedOfferId, setSelectedOfferId] = useState<string>("priya");
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const selectedOffer = OFFERS.find((o) => o.id === selectedOfferId) || OFFERS[0];

  const handleAccept = () => {
    setIsAccepted(true);
  };

  const handleReset = () => {
    setIsAccepted(false);
  };

  return (
    <div className="relative mx-auto max-w-md rounded-2xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Live Badge Indicator at top right */}
      <div className="absolute -top-3 right-6 flex items-center gap-1.5 rounded-full bg-[var(--color-primary-600)] px-3 py-1 text-[11px] font-semibold text-white shadow-md shadow-[var(--color-primary-600)]/30 animate-pulse">
        <Sparkles className="h-3 w-3" />
        <span>Interactive Live Demo</span>
      </div>

      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-neutral-100)] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 rounded-full bg-[var(--color-primary-500)] ring-4 ring-[var(--color-primary-100)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-800)] flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-[var(--color-primary-600)]" />
            Palm Meadows Residency
          </span>
        </div>
        <span className="rounded-md bg-[var(--color-primary-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary-700)] border border-[var(--color-primary-200)]">
          Active Community
        </span>
      </div>

      {/* Example Active Need Card */}
      <div className="mt-4 rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)]/70 p-4 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar name="Rahul Sharma" size="sm" />
            <div>
              <p className="text-xs font-bold text-[var(--color-neutral-900)]">
                Rahul S. <span className="font-medium text-[var(--color-neutral-500)]">(Block B-402)</span>
              </p>
              <p className="text-[11px] text-[var(--color-neutral-500)]">Requested 12 mins ago</p>
            </div>
          </div>
          <Badge variant="borrow">Borrow</Badge>
        </div>
        <p className="mt-2.5 text-sm font-semibold text-[var(--color-neutral-900)] leading-snug">
          Need a cordless power drill for hanging picture frames tomorrow morning.
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-primary-800)] font-medium">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Needed: Tomorrow, 9 AM – 1 PM
          </span>
          <span className="font-semibold text-[var(--color-primary-600)] bg-white/80 px-2 py-0.5 rounded-md border border-[var(--color-primary-200)]">
            2 offers received
          </span>
        </div>
      </div>

      {/* Matching Offer Selection Simulation */}
      {!isAccepted ? (
        <div className="mt-3.5 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
            Select an offer from your neighbors:
          </p>

          {OFFERS.map((offer) => {
            const isSelected = selectedOfferId === offer.id;
            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => setSelectedOfferId(offer.id)}
                className={`w-full text-left rounded-xl border p-3.5 transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]/40 ring-2 ring-[var(--color-primary-500)]/30 shadow-xs"
                    : "border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-[var(--color-primary-600)] bg-[var(--color-primary-600)] text-white"
                        : "border-[var(--color-neutral-300)] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <Avatar name={offer.name} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-[var(--color-neutral-900)]">
                      {offer.name} <span className="font-normal text-[var(--color-neutral-500)]">({offer.unit})</span>
                    </p>
                    <p className="text-[11px] text-[var(--color-neutral-600)] font-medium">
                      {offer.item}
                    </p>
                  </div>
                </div>

                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 shrink-0">
                  {offer.status}
                </span>
              </button>
            );
          })}

          {/* Quick Simulation Action Bar */}
          <div className="mt-4 pt-3 border-t border-[var(--color-neutral-100)] flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-neutral-500)]">
              Click to test matching
            </span>
            <Button
              type="button"
              onClick={handleAccept}
              variant="primary"
              size="sm"
              className="gap-1.5 shadow-sm shadow-[var(--color-primary-500)]/20 font-bold"
            >
              <CheckCircle2 className="h-4 w-4" />
              Accept {selectedOffer.name.split(" ")[0]}&apos;s Offer
            </Button>
          </div>
        </div>
      ) : (
        /* Accepted State — High Conversion Success View */
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 transition-all animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Offer Accepted! 🎉
              </h4>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                <span className="font-semibold">{selectedOffer.item}</span> reserved from{" "}
                <span className="font-semibold">{selectedOffer.name}</span> ({selectedOffer.unit}). Pickup details shared securely!
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200 flex flex-col sm:flex-row items-center gap-2.5">
            <Link href="/signup" className="w-full sm:flex-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full gap-1.5 font-bold shadow-sm"
              >
                Join Jod for Free <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100"
              title="Test again"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Replay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
