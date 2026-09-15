import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for client-side / browser usage (e.g. Realtime subscriptions).
 * NEVER use service role keys in this client.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Provide a descriptive message in development if keys are not configured yet
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Supabase credentials not configured in NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
  }

  return createBrowserClient(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );
}
