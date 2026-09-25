"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, ChevronDown, ShoppingBag, PackagePlus } from "lucide-react";

/**
 * QuickCreateMenu — Unified create/post dropdown for authenticated header.
 * Allows neighbors to either:
 * 1. Ask for something (Post a Need) -> /needs/create
 * 2. Offer something (List an Item / Service) -> /listings/create
 *
 * Keeps the header clean without duplicate action buttons ("ghich-pich").
 */
export function QuickCreateMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Close on Escape key
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Post a need or offer an item"
        className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-600)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[var(--color-primary-700)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] active:scale-95 cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Post</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute left-0 mt-2 w-72 rounded-2xl border border-[var(--color-neutral-200)] bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 transition-all animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            Quick Post
          </div>

          <div className="space-y-1">
            {/* Option 1: Post a Need */}
            <Link
              href="/needs/create"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--color-neutral-50)] group text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] transition-colors group-hover:bg-[var(--color-primary-100)]">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)]">
                  Request an Item
                </div>
                <div className="text-[11px] text-[var(--color-neutral-500)] truncate">
                  Borrow, rent, or find local help
                </div>
              </div>
            </Link>

            {/* Option 2: Offer an Item / Service */}
            <Link
              href="/listings/create"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--color-neutral-50)] group text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                <PackagePlus className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[var(--color-neutral-900)] group-hover:text-blue-700">
                  Share an Item
                </div>
                <div className="text-[11px] text-[var(--color-neutral-500)] truncate">
                  Lend, rent out, or sell to neighbors
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
