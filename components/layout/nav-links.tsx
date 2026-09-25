"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Package, Users } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/needs", label: "Needs", icon: ShoppingBag },
  { href: "/listings", label: "Available Items", icon: Package },
  { href: "/communities", label: "Communities", icon: Users },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="hidden items-center gap-1 sm:flex"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] ${
              isActive
                ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold border border-[var(--color-primary-200)] shadow-2xs"
                : "font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)]"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${
                isActive
                  ? "text-[var(--color-primary-600)]"
                  : "text-[var(--color-neutral-400)]"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
