import Link from "next/link";
import { getSessionUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Link2 } from "lucide-react";
import { NavLinks } from "@/components/layout/nav-links";
import { QuickCreateMenu } from "@/components/layout/quick-create-menu";
import { UserNavMenu } from "@/components/layout/user-nav-menu";

/**
 * AppHeader — Authenticated Application Header
 *
 * Server Component. Reads the session server-side via getSessionUser().
 * Displays the Jod brand, main navigation, user identity, and logout.
 * Logout is submitted via a <form> with the signOut server action — no client JS required.
 */
export async function AppHeader() {
  const user = await getSessionUser();
  let displayName = "User";

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.userId)
      .single();

    displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-neutral-200)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/needs"
          title="Go to Needs Feed (Home)"
          className="flex items-center gap-2 rounded-lg transition-transform active:scale-95 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] text-white shadow-xs">
            <Link2 className="h-4 w-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[var(--color-neutral-900)]">
            Jod
          </span>
        </Link>

        {/* Dynamic Navigation with Active States */}
        <NavLinks />

        {/* User controls */}
        <div className="flex items-center gap-3">
          {/* Unified Create Menu (Ask for a Need OR Offer an Item) */}
          <QuickCreateMenu />

          {/* User Account Menu (Profile, Requests, Shared Items, Logout) */}
          {user && (
            <UserNavMenu
              displayName={displayName}
              email={user.email}
              signOutAction={signOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}
