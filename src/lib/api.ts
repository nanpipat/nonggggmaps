/**
 * PawMap data layer.
 *
 * The API surface intentionally mirrors a future Supabase implementation:
 *   places, reviews, favorites, suggested_edits, profiles
 *
 * For now everything lives in localStorage. To swap to Supabase later, just
 * replace the body of these functions with `supabase.from('places')...` calls.
 */
import type { AppUser, Place, Review, SuggestedEdit } from "./types";
import { SEED_PLACES, SEED_REVIEWS } from "./mock-data";

const KEYS = {
  PLACES: "pawmap.places.v1",
  REVIEWS: "pawmap.reviews.v1",
  FAVORITES: "pawmap.favorites.v1",
  USER: "pawmap.user.v1",
  EDITS: "pawmap.edits.v1",
  SEEDED: "pawmap.seeded.v1",
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
  write(KEYS.PLACES, SEED_PLACES);
  write(KEYS.REVIEWS, SEED_REVIEWS);
  localStorage.setItem(KEYS.SEEDED, "1");
}

// Initialise on first import (client-side only)
if (isBrowser) ensureSeed();

// ===================== Places =====================
export const placesApi = {
  list(): Place[] {
    if (!isBrowser) return SEED_PLACES;
    ensureSeed();
    return read<Place[]>(KEYS.PLACES, SEED_PLACES);
  },
  byId(id: string): Place | null {
    return this.list().find((p) => p.id === id) ?? null;
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
    const merged = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
    all[idx] = merged;
    write(KEYS.PLACES, all);
    return merged;
  },
};

// ===================== Reviews =====================
export const reviewsApi = {
  byPlace(placeId: string): Review[] {
    return read<Review[]>(KEYS.REVIEWS, SEED_REVIEWS).filter((r) => r.place_id === placeId);
  },
  byUser(userId: string): Review[] {
    return read<Review[]>(KEYS.REVIEWS, SEED_REVIEWS).filter((r) => r.user_id === userId);
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
    const placeReviews = [review, ...all].filter((r) => r.place_id === review.place_id);
    const avg = placeReviews.reduce((a, b) => a + b.rating, 0) / placeReviews.length;
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

// ===================== User / Auth (mock) =====================
export const authApi = {
  current(): AppUser | null {
    return read<AppUser | null>(KEYS.USER, null);
  },
  signInWithGoogle(): AppUser {
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
      avatar: p.name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .toUpperCase(),
      provider: "google",
      joined_at: new Date().toISOString(),
    };
    write(KEYS.USER, u);
    return u;
  },
  signInWithEmail(email: string, name: string): AppUser {
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
  signOut(): void {
    if (!isBrowser) return;
    localStorage.removeItem(KEYS.USER);
  },
};

// ===================== Suggested edits =====================
export const editsApi = {
  list(): SuggestedEdit[] {
    return read<SuggestedEdit[]>(KEYS.EDITS, []);
  },
  create(input: Omit<SuggestedEdit, "id" | "created_at">): SuggestedEdit {
    const e: SuggestedEdit = { ...input, id: "e_" + Date.now(), created_at: new Date().toISOString() };
    write(KEYS.EDITS, [e, ...this.list()]);
    return e;
  },
};

// ===================== Export/Import =====================
export const dataApi = {
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
