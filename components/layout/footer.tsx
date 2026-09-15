import React from "react";
import Link from "next/link";
import { HandHelping, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-600)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-500)] text-white">
                <HandHelping className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
                Needly
              </span>
            </Link>
            <p className="max-w-sm text-sm text-[var(--color-neutral-500)] leading-relaxed">
              A trusted community-based marketplace for needs, resources, rentals, purchases, and services. Connect with your neighbors and get things done.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--color-neutral-500)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-primary-600)]" />
              <span>Gated within trusted community boundaries</span>
            </div>
          </div>

          {/* Modalities */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-900)]">
              Marketplace
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <span className="text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]">
                  Borrow Items
                </span>
              </li>
              <li>
                <span className="text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]">
                  Rent Equipment
                </span>
              </li>
              <li>
                <span className="text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]">
                  Buy & Sell
                </span>
              </li>
              <li>
                <span className="text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]">
                  Local Services
                </span>
              </li>
            </ul>
          </div>

          {/* Community Types */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-900)]">
              Communities
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <span className="text-[var(--color-neutral-600)]">Apartment Societies</span>
              </li>
              <li>
                <span className="text-[var(--color-neutral-600)]">Gated Layouts</span>
              </li>
              <li>
                <span className="text-[var(--color-neutral-600)]">Colleges & Hostels</span>
              </li>
              <li>
                <span className="text-[var(--color-neutral-600)]">Office Campuses</span>
              </li>
            </ul>
          </div>

          {/* Product Principles */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-900)]">
              Product Principles
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-[var(--color-neutral-500)]">Need First</li>
              <li className="text-[var(--color-neutral-500)]">Zero WhatsApp Clutter</li>
              <li className="text-[var(--color-neutral-500)]">Structured Matching</li>
              <li className="text-[var(--color-neutral-500)]">Verified Trust</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-[var(--color-neutral-200)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--color-neutral-400)]">
            &copy; {new Date().getFullYear()} Needly. Built for trusted communities.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs text-[var(--color-neutral-500)] sm:mt-0">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-[var(--color-primary-500)] text-[var(--color-primary-500)]" />
            <span>for local neighborhoods</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
