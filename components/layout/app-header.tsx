import Link from "next/link";
import { getSessionUser } from "@/lib/auth/dal";
import { signOut } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, LayoutDashboard, Users, ShoppingBag, Package } from "lucide-react";

/**
 * AppHeader — Authenticated Application Header
 *
 * Server Component. Reads the session server-side via getSessionUser().
 * Displays the Needly brand, main navigation, user identity, and logout.
 * Logout is submitted via a <form> with the signOut server action — no client JS required.
 */
export async function AppHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-neutral-200)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
        >
          <span className="text-lg font-extrabold tracking-tight text-[var(--color-neutral-900)]">
            Needly
          </span>
        </Link>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 sm:flex"
        >
          <NavLink href="/profile" icon={<LayoutDashboard className="h-3.5 w-3.5" />}>
            My Profile
          </NavLink>
          <NavLink href="/needs" icon={<ShoppingBag className="h-3.5 w-3.5" />}>
            Needs
          </NavLink>
          <NavLink href="/listings" icon={<Package className="h-3.5 w-3.5" />}>
            Offerings
          </NavLink>
          <NavLink href="/communities" icon={<Users className="h-3.5 w-3.5" />}>
            Communities
          </NavLink>
        </nav>

        {/* User controls */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2.5">
              <Avatar name={user.email ?? "User"} size="sm" />
              <span className="hidden text-sm font-medium text-[var(--color-neutral-700)] sm:block">
                {user.email}
              </span>
            </div>
          )}

          {/* Logout via server action form — works without JS */}
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-xs font-medium text-[var(--color-neutral-600)] transition-colors hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-neutral-900)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Internal NavLink helper
// ---------------------------------------------------------------------------

function NavLink({
  href,
  icon,
  children,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Coming soon"
        className="flex cursor-not-allowed items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-neutral-400)]"
      >
        {icon}
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
    >
      {icon}
      {children}
    </Link>
  );
}
