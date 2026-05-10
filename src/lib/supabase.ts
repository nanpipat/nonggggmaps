/**
 * Supabase client (optional).
 * The app currently runs on mock data. When you're ready to wire up the real
 * backend, fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY,
 * then swap the bodies of `placesApi`, `reviewsApi`, etc. in `src/lib/api.ts`
 * with calls to this client.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = !!supabase;
