/**
 * Supabase client + auth helpers.
 *
 * Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * to enable real auth + data. Without them the app falls back to localStorage mock.
 */
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AppUser } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = !!supabase;

/** Map a Supabase User → AppUser domain type. */
export function supabaseUserToAppUser(u: User): AppUser {
  const meta = u.user_metadata ?? {};
  const rawName: string =
    meta.name ??
    meta.full_name ??
    meta.display_name ??
    u.email?.split("@")[0] ??
    "User";
  return {
    id: u.id,
    name: rawName,
    email: u.email ?? "",
    avatar:
      meta.avatar ??
      rawName
        .split(" ")
        .map((s: string) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    provider: (u.app_metadata?.provider === "google" ? "google" : "email") as
      | "google"
      | "email",
    joined_at: u.created_at,
  };
}
