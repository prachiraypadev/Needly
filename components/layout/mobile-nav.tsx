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
  { href: "/listings", label: "Offerings", icon: Package },
  { href: "/needs/create", label: "Post Need", icon: Plus, isSpecial: true },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
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
            <Link
              key={item.href}
              href={item.href}
              className="group relative -top-3 flex flex-col items-center"
              title="Post a Need"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-white shadow-md shadow-[var(--color-primary-600)]/40 transition-transform active:scale-95 hover:bg-[var(--color-primary-700)]">
                <Plus className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="mt-0.5 text-[10px] font-bold text-[var(--color-primary-700)]">
                Post
              </span>
            </Link>
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
  );
}
