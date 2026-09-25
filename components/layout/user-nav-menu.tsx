"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface UserNavMenuProps {
  displayName: string;
  email?: string;
  signOutAction: () => Promise<void>;
}

/**
 * UserNavMenu — Dedicated account dropdown anchored to user avatar.
 * Streamlined to My Profile, Settings, and Sign out for a clean,
 * professional account menu without redundant navigation.
 */
export function UserNavMenu({
  displayName,
  email,
  signOutAction,
}: UserNavMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

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

  const firstName = displayName.split(" ")[0];
  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile");
  const isSettingsActive = pathname === "/settings" || pathname.startsWith("/settings");

  const menuItems = [
    {
      href: "/profile",
      label: "My Profile",
      icon: UserIcon,
      isActive: isProfileActive,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      isActive: isSettingsActive,
    },
  ];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger: User Avatar + Name (with Active state when on /profile) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User account menu"
        className={`flex items-center gap-2 rounded-lg py-1 px-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] ${
          isProfileActive
            ? "bg-[var(--color-primary-50)] border border-[var(--color-primary-300)] text-[var(--color-primary-800)] shadow-2xs font-semibold"
            : "hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]"
        }`}
      >
        <Avatar name={displayName} size="sm" />
        <span className="hidden text-xs font-bold sm:block max-w-[120px] truncate">
          {firstName}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          } ${isProfileActive ? "text-[var(--color-primary-600)]" : "text-[var(--color-neutral-400)]"}`}
        />
      </button>

      {/* Account Menu Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-[var(--color-neutral-200)] bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 transition-all animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* User Info Header */}
          <div className="px-3 py-2 border-b border-[var(--color-neutral-100)] mb-1">
            <div className="text-xs font-bold text-[var(--color-neutral-900)] truncate">
              {displayName}
            </div>
            {email && (
              <div className="text-[11px] text-[var(--color-neutral-500)] truncate">
                {email}
              </div>
            )}
          </div>

          {/* Personal Account Navigation */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-150 cursor-pointer ${
                    item.isActive
                      ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold border border-[var(--color-primary-200)]/70 shadow-2xs"
                      : "font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-primary-50)]/40 hover:text-[var(--color-primary-700)] hover:translate-x-0.5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        item.isActive
                          ? "text-[var(--color-primary-600)]"
                          : "text-[var(--color-neutral-400)] group-hover:text-[var(--color-primary-600)]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.isActive && (
                    <span className="flex items-center gap-1 rounded-full bg-[var(--color-primary-100)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary-700)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-600)] animate-pulse" />
                      Active
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider & Sign out */}
          <div className="border-t border-[var(--color-neutral-100)] mt-1.5 pt-1">
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition-all duration-150 hover:bg-red-50 hover:translate-x-0.5 cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-red-500 transition-transform group-hover:scale-110" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
