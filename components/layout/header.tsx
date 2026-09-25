"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Link2, Menu, X, Sparkles, ShieldCheck, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

interface HeaderProps {
  user?: {
    userId: string;
    email?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Thin page-progress line along the bottom of the header
  useEffect(() => {
    if (isAuthPage) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty("transform", `scaleX(${max > 0 ? window.scrollY / max : 0})`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isAuthPage]);

  // Agar user Login ya Signup page par hai, toh marketing navbar mat dikhao!
  if (isAuthPage) {
    return null;
  }

  return (
    <header className="site-header sticky top-0 z-40 w-full border-b border-[var(--color-neutral-200)]/70 bg-white/70 backdrop-blur-xl backdrop-saturate-150 transition-all">
      <div ref={progressRef} className="site-header__progress" aria-hidden="true" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="brand-mark flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] text-white shadow-sm shadow-[var(--color-primary-500)]/20">
            <Link2 className="h-5 w-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
              Jod
            </span>
            <span className="hidden text-[10px] font-medium text-[var(--color-neutral-500)] -mt-1 sm:inline">
              Community Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-neutral-900)]"
          >
            How It Works
          </a>
          <a
            href="#modalities"
            className="text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-neutral-900)]"
          >
            Borrow, Rent & Services
          </a>
          <a
            href="#community-trust"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-neutral-900)]"
          >
            <ShieldCheck className="h-4 w-4 text-[var(--color-primary-500)]" />
            Trust Boundary
          </a>
          <a
            href="#examples"
            className="text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-neutral-900)]"
          >
            Real Examples
          </a>
        </nav>

        {/* Desktop Action Buttons (Dynamic based on Logged In state) */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/needs">
                <Button variant="ghost" size="md">
                  Community Feed
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="md" className="gap-1.5 font-semibold">
                  <User className="h-4 w-4 text-[var(--color-primary-600)]" />
                  My Profile
                </Button>
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="md" type="submit" className="text-[var(--color-neutral-600)] hover:text-red-600">
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="md">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="md" className="gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Create account
                </Button>
              </Link>
            </>
          )}
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
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-1.5">
                      <User className="h-4 w-4" />
                      My Profile
                    </Button>
                  </Link>
                  <Link href="/needs" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-center">
                      Community Feed
                    </Button>
                  </Link>
                  <form action={signOut} className="w-full">
                    <Button variant="ghost" type="submit" className="w-full justify-center text-red-600">
                      <LogOut className="h-4 w-4 mr-1.5" />
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Create account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
