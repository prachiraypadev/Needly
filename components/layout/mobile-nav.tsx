"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Package, Plus, Users, User } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isSpecial?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/needs", label: "Needs", icon: ShoppingBag },
  { href: "/listings", label: "Available", icon: Package },
  { href: "/needs/create", label: "Post Need", icon: Plus, isSpecial: true },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Action Sheet Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity sm:hidden"
        />
      )}

      {/* Mobile Action Sheet Popover */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-[var(--color-neutral-200)] bg-white p-3 shadow-2xl transition-all sm:hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-neutral-100)] px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]">
              Post to Community
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            <Link
              href="/needs/create"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--color-neutral-50)] active:bg-[var(--color-neutral-100)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[var(--color-neutral-900)]">
                  Request an Item
                </div>
                <div className="text-[11px] text-[var(--color-neutral-500)]">
                  Borrow, rent, or find local help
                </div>
              </div>
            </Link>

            <Link
              href="/listings/create"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--color-neutral-50)] active:bg-[var(--color-neutral-100)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[var(--color-neutral-900)]">
                  Share an Item
                </div>
                <div className="text-[11px] text-[var(--color-neutral-500)]">
                  Lend, rent out, or sell to neighbors
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[var(--color-neutral-200)] bg-white/95 backdrop-blur-md px-2 sm:hidden shadow-lg"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/needs"
              ? pathname === "/needs" || (pathname.startsWith("/needs/") && pathname !== "/needs/create")
              : pathname.startsWith(item.href);

          if (item.isSpecial) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="group relative -top-3 flex flex-col items-center cursor-pointer"
                title="Post a Need or Offer"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-white shadow-md shadow-[var(--color-primary-600)]/40 transition-transform active:scale-90 hover:bg-[var(--color-primary-700)] ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <Plus className="h-6 w-6 stroke-[2.5] transition-transform duration-200" />
                </div>
                <span className="mt-0.5 text-[10px] font-bold text-[var(--color-primary-700)]">
                  Post
                </span>
              </button>
            );
          }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
              isActive
                ? "text-[var(--color-primary-600)] font-semibold"
                : "text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-800)]"
            }`}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[var(--color-primary-600)]" />
              )}
            </div>
            <span className="mt-1 text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
    </>
  );
}
