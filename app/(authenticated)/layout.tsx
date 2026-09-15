import { verifySession } from "@/lib/auth/dal";
import { AppHeader } from "@/components/layout/app-header";

/**
 * Authenticated Route Group Layout
 *
 * All routes under app/(authenticated)/ require a valid session.
 * verifySession() is the authoritative security check — it calls
 * supabase.auth.getUser() and redirects to /login if unauthenticated.
 * This works independently of and in addition to the proxy.ts optimistic check.
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /login if no valid session exists
  await verifySession();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-neutral-50)]">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
//test comment 