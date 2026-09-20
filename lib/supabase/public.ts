import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Read-only anonymous client for published public content.
 *
 * Public Scripture reads must not depend on a user session, so this client never
 * touches cookies: that keeps the public routes renderable per request and free of
 * auth state. Published-only visibility is enforced twice - by RLS on the tables and
 * by an explicit `status = published` filter in the queries.
 *
 * Responses are intentionally uncached (`no-store`) so a newly published Scripture
 * Work appears on the public archive immediately.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function createSupabasePublicClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) }
    }
  );
}
