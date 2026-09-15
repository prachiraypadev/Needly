"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HandHelping, Menu, X, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-neutral-200)] bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-500)] text-white shadow-xs">
            <HandHelping className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
              Needly
            </span>
            <span className="hidden text-[10px] font-medium text-[var(--color-neutral-500)] -mt-1 sm:inline">
              Community Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-neutral-900)]"
          >
            How It Works
          </Link>
          <Link
            href="#modalities"
            className="text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-neutral-900)]"
          >
            Borrow, Rent & Services
          </Link>
          <Link
            href="#community-trust"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-neutral-900)]"
          >
            <ShieldCheck className="h-4 w-4 text-[var(--color-primary-500)]" />
            Trust Boundary
          </Link>
          <Link
            href="#examples"
            className="text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-neutral-900)]"
          >
            Real Examples
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="md">
              Sign In
            </Button>
          </Link>
          <Link href="/join-community">
            <Button variant="primary" size="md" className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              Join Your Community
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] md:hidden focus-ring"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[var(--color-neutral-200)] bg-white px-4 pt-2 pb-6 md:hidden">
          <div className="flex flex-col space-y-3 pt-2">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
            >
              How It Works
            </Link>
            <Link
              href="#modalities"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
            >
              Borrow, Rent, Buy & Services
            </Link>
            <Link
              href="#community-trust"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
            >
              Trust Boundary
            </Link>
            <Link
              href="#examples"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
            >
              Real Community Needs
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-[var(--color-neutral-200)]">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/join-community" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Join Your Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
