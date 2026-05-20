/**
 * PawMap data layer.
 *
 * Places are loaded from Supabase when configured; everything else
 * (reviews, favorites, auth, edits, checkins) stays in localStorage.
 * Swap remaining functions to Supabase as needed later.
 */
import type { AppUser, CheckIn, Place, Review, SuggestedEdit } from "./types";
import { SEED_PLACES, SEED_REVIEWS } from "./mock-data";
import { supabase, supabaseUserToAppUser } from "./supabase";

const KEYS = {
  PLACES: "pawmap.places.v1",
  REVIEWS: "pawmap.reviews.v1",
  FAVORITES: "pawmap.favorites.v1",
  USER: "pawmap.user.v1",
  EDITS: "pawmap.edits.v1",
  CHECKINS: "pawmap.checkins.v1",
  SEEDED: "pawmap.seeded.v3",
} as const;

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed(): void {
  if (!isBrowser) return;
  if (localStorage.getItem(KEYS.SEEDED) === "1") return;
  const currentPlaces = read<Place[]>(KEYS.PLACES, []);
  const seedIds = new Set(SEED_PLACES.map((place) => place.id));
  const userPlaces = currentPlaces.filter((place) => !seedIds.has(place.id));
  write(KEYS.PLACES, [...SEED_PLACES, ...userPlaces]);

  const currentReviews = read<Review[]>(KEYS.REVIEWS, []);
  write(KEYS.REVIEWS, currentReviews.length > 0 ? currentReviews : SEED_REVIEWS);
  localStorage.setItem(KEYS.SEEDED, "1");
}

// Initialise on first import (client-side only)
if (isBrowser) ensureSeed();

// ===================== Places =====================
export const placesApi = {
  /** Sync read — localStorage only (fallback / SSR). */
  list(): Place[] {
    if (!isBrowser) return SEED_PLACES;
    ensureSeed();
    return read<Place[]>(KEYS.PLACES, SEED_PLACES);
  },

  /** Async read — Supabase when configured, localStorage fallback. */
  async listAsync(): Promise<Place[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("added_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Place[];
      }
    }
    return this.list();
  },

  byId(id: string): Place | null {
    return this.list().find((p) => p.id === id) ?? null;
  },

  async byIdAsync(id: string): Promise<Place | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) return data as Place;
    }
    return this.byId(id);
  },

  create(p: Omit<Place, "id" | "added_at" | "rating" | "review_count">): Place {
    const newPlace: Place = {
      ...p,
      id: "p_" + Date.now(),
      rating: 0,
      review_count: 0,
      added_at: new Date().toISOString(),
    };
    const all = this.list();
    write(KEYS.PLACES, [newPlace, ...all]);
    return newPlace;
  },

  update(id: string, patch: Partial<Place>): Place | null {
    const all = this.list();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const merged = {
      ...all[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    all[idx] = merged;
    write(KEYS.PLACES, all);
    return merged;
  },
};

// ===================== Reviews =====================
export const reviewsApi = {
  byPlace(placeId: string): Review[] {
    return read<Review[]>(KEYS.REVIEWS, SEED_REVIEWS).filter(
      (r) => r.place_id === placeId,
    );
  },
  byUser(userId: string): Review[] {
    return read<Review[]>(KEYS.REVIEWS, SEED_REVIEWS).filter(
      (r) => r.user_id === userId,
    );
  },
  create(input: Omit<Review, "id" | "created_at">): Review {
    const review: Review = {
      ...input,
      id: "r_" + Date.now(),
      created_at: new Date().toISOString(),
    };
    const all = read<Review[]>(KEYS.REVIEWS, []);
    write(KEYS.REVIEWS, [review, ...all]);
    // Recompute place rating
    const placeReviews = [review, ...all].filter(
      (r) => r.place_id === review.place_id,
    );
    const avg =
      placeReviews.reduce((a, b) => a + b.rating, 0) / placeReviews.length;
    placesApi.update(review.place_id, {
      rating: Math.round(avg * 10) / 10,
      review_count: placeReviews.length,
    });
    return review;
  },
};

// ===================== Favorites =====================
export const favoritesApi = {
  list(): string[] {
    return read<string[]>(KEYS.FAVORITES, []);
  },
  has(placeId: string): boolean {
    return this.list().includes(placeId);
  },
  toggle(placeId: string): boolean {
    const list = this.list();
    const i = list.indexOf(placeId);
    if (i === -1) list.push(placeId);
    else list.splice(i, 1);
    write(KEYS.FAVORITES, list);
    return i === -1;
  },
};

// ===================== User / Auth =====================
export const authApi = {
  /** Sync read from localStorage (used on first hydrate). */
  current(): AppUser | null {
    return read<AppUser | null>(KEYS.USER, null);
  },

  /** Check live Supabase session, fall back to localStorage. */
  async currentSession(): Promise<AppUser | null> {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const u = supabaseUserToAppUser(data.session.user);
        write(KEYS.USER, u);
        return u;
      }
    }
    return this.current();
  },

  /**
   * Register a new account with email + password.
   * Returns user on success, or an error string on failure.
   */
  async signUpWithEmail(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: AppUser | null; error: string | null }> {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar: name
              .split(" ")
              .map((s) => s[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
          },
        },
      });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const u = supabaseUserToAppUser(data.user);
        write(KEYS.USER, u);
        return { user: u, error: null };
      }
      // Email confirmation required — user exists but no session yet
      return { user: null, error: null };
    }
    // Mock fallback (no Supabase configured)
    const u = this._mockSignIn(email, name);
    return { user: u, error: null };
  },

  /**
   * Sign in with email + password.
   * Returns user on success, or an error string on failure.
   */
  async signInWithEmailPassword(
    email: string,
    password: string,
  ): Promise<{ user: AppUser | null; error: string | null }> {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const u = supabaseUserToAppUser(data.user);
        write(KEYS.USER, u);
        return { user: u, error: null };
      }
    }
    // Mock fallback
    const u = this._mockSignIn(email, email.split("@")[0]);
    return { user: u, error: null };
  },

  /**
   * Initiate Google OAuth sign-in.
   * With Supabase: redirects to Google → returns null (page navigates).
   * Without Supabase: returns a random mock user immediately.
   */
  async signInWithGoogle(): Promise<{ user: AppUser | null; error: string | null }> {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
      });
      if (error) return { user: null, error: error.message };
      return { user: null, error: null }; // browser will redirect
    }
    // Mock fallback
    const profiles = [
      { name: "Pim Pawsome", email: "pim@gmail.com" },
      { name: "Tonn Suthep", email: "tonn@gmail.com" },
      { name: "June Cattie", email: "june@gmail.com" },
    ];
    const p = profiles[Math.floor(Math.random() * profiles.length)];
    const u: AppUser = {
      id: "u_" + Date.now(),
      name: p.name,
      email: p.email,
      avatar: p.name.split(" ").map((s) => s[0]).join("").toUpperCase(),
      provider: "google",
      joined_at: new Date().toISOString(),
    };
    write(KEYS.USER, u);
    return { user: u, error: null };
  },

  /** Subscribe to Supabase auth state changes. Returns unsubscribe fn. */
  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = supabaseUserToAppUser(session.user);
        write(KEYS.USER, u);
        callback(u);
      } else {
        callback(null);
      }
    });
    return () => data.subscription.unsubscribe();
  },

  signInAsGuest(): AppUser {
    const u: AppUser = {
      id: "guest",
      name: "Guest",
      email: "",
      avatar: "G",
      provider: "guest",
      joined_at: new Date().toISOString(),
    };
    write(KEYS.USER, u);
    return u;
  },

  async signOut(): Promise<void> {
    if (supabase) await supabase.auth.signOut();
    if (isBrowser) localStorage.removeItem(KEYS.USER);
    this.signInAsGuest();
  },

  // ---- internal helpers ----
  _mockSignIn(email: string, name: string): AppUser {
    const u: AppUser = {
      id: "u_" + Date.now(),
      name: name || email.split("@")[0],
      email,
      avatar: (name || email)[0].toUpperCase(),
      provider: "email",
      joined_at: new Date().toISOString(),
    };
    write(KEYS.USER, u);
    return u;
  },
};

// ===================== Suggested edits =====================
export const editsApi = {
  list(): SuggestedEdit[] {
    return read<SuggestedEdit[]>(KEYS.EDITS, []);
  },
  create(input: Omit<SuggestedEdit, "id" | "created_at">): SuggestedEdit {
    const e: SuggestedEdit = {
      ...input,
      id: "e_" + Date.now(),
      created_at: new Date().toISOString(),
    };
    write(KEYS.EDITS, [e, ...this.list()]);
    return e;
  },
};

// ===================== Check-ins =====================
export const checkinsApi = {
  byPlace(placeId: string): CheckIn[] {
    return read<CheckIn[]>(KEYS.CHECKINS, []).filter(
      (c) => c.place_id === placeId,
    );
  },
  create(input: Omit<CheckIn, "id" | "created_at">): CheckIn {
    const ci: CheckIn = {
      ...input,
      id: "ci_" + Date.now(),
      created_at: new Date().toISOString(),
    };
    const all = read<CheckIn[]>(KEYS.CHECKINS, []);
    write(KEYS.CHECKINS, [ci, ...all]);
    return ci;
  },
};

// ===================== Export/Import =====================
export const dataApi: {
  exportAll(): {
    places: Place[];
    reviews: Review[];
    favorites: string[];
    user: AppUser | null;
    edits: SuggestedEdit[];
    exported_at: string;
  };
  importAll(data: ReturnType<typeof dataApi.exportAll>): void;
  reset(): void;
} = {
  exportAll() {
    return {
      places: placesApi.list(),
      reviews: read<Review[]>(KEYS.REVIEWS, []),
      favorites: favoritesApi.list(),
      user: authApi.current(),
      edits: editsApi.list(),
      exported_at: new Date().toISOString(),
    };
  },
  importAll(data: ReturnType<typeof dataApi.exportAll>) {
    if (data.places) write(KEYS.PLACES, data.places);
    if (data.reviews) write(KEYS.REVIEWS, data.reviews);
    if (data.favorites) write(KEYS.FAVORITES, data.favorites);
    if (data.user) write(KEYS.USER, data.user);
    if (data.edits) write(KEYS.EDITS, data.edits);
  },
  reset() {
    if (!isBrowser) return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
