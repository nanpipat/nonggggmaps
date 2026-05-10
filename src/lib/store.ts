"use client";

import { create } from "zustand";
import type {
  AppUser,
  Coords,
  Filters,
  Place,
  PetType,
  PlaceCategory,
  Review,
  SortBy,
} from "./types";
import { distanceKm } from "./geo";
import { authApi, favoritesApi, placesApi, reviewsApi } from "./api";

interface AppState {
  // Data
  places: Place[];
  user: AppUser | null;
  favorites: string[];
  userLocation: Coords | null;

  // UI / nav
  selectedPlaceId: string | null;
  detailOpen: boolean;
  filterOpen: boolean;
  addOpen: boolean;
  reviewOpen: boolean;
  pickingLocation: boolean;
  pickingResult: Coords | null;
  drawerOpen: boolean;
  activeTab: "explore" | "favorites" | "myreviews" | "profile";

  // Filters
  filters: Filters;
  sortBy: SortBy;

  // Map viewport
  mapBounds: { north: number; south: number; east: number; west: number } | null;
  setMapBounds(b: { north: number; south: number; east: number; west: number } | null): void;

  // Actions
  hydrate(): void;
  setUser(u: AppUser | null): void;
  setUserLocation(c: Coords | null): void;
  refreshPlaces(): void;
  toggleFavorite(id: string): void;

  selectPlace(id: string | null): void;
  openDetail(): void;
  closeDetail(): void;

  setFilterOpen(open: boolean): void;
  setAddOpen(open: boolean): void;
  setReviewOpen(open: boolean): void;
  setDrawerOpen(open: boolean): void;
  setActiveTab(tab: AppState["activeTab"]): void;

  startPickingLocation(): void;
  cancelPickingLocation(): void;
  confirmPickingLocation(c: Coords): void;

  setSearch(q: string): void;
  togglePet(p: PetType): void;
  setPet(p: PetType | null): void;
  toggleCategory(c: PlaceCategory): void;
  toggleCondition(k: keyof Filters["conditions"] | string): void;
  toggleSize(s: "small" | "medium" | "large"): void;
  setMinRating(r: number): void;
  resetFilters(): void;
  setSort(s: SortBy): void;

  // derived helpers
  getFiltered(): Place[];
  reviewsFor(placeId: string): Review[];
}

const initialFilters = (): Filters => ({
  search: "",
  pet_types: new Set(),
  categories: new Set(),
  conditions: new Set(),
  sizes: new Set(),
  min_rating: 0,
});

export const useApp = create<AppState>((set, get) => ({
  places: [],
  user: null,
  favorites: [],
  userLocation: null,

  selectedPlaceId: null,
  detailOpen: false,
  filterOpen: false,
  addOpen: false,
  reviewOpen: false,
  pickingLocation: false,
  pickingResult: null,
  drawerOpen: false,
  activeTab: "explore",

  filters: initialFilters(),
  sortBy: "distance",
  mapBounds: null,

  hydrate() {
    set({
      places: placesApi.list(),
      user: authApi.current(),
      favorites: favoritesApi.list(),
    });
  },

  setUser(u) { set({ user: u }); },
  setUserLocation(c) { set({ userLocation: c }); },
  refreshPlaces() { set({ places: placesApi.list() }); },
  toggleFavorite(id) {
    favoritesApi.toggle(id);
    set({ favorites: favoritesApi.list() });
  },

  selectPlace(id) { set({ selectedPlaceId: id, detailOpen: false }); },
  openDetail() { set({ detailOpen: true }); },
  closeDetail() { set({ detailOpen: false, selectedPlaceId: null }); },

  setFilterOpen(open) { set({ filterOpen: open }); },
  setAddOpen(open) { set({ addOpen: open }); },
  setReviewOpen(open) { set({ reviewOpen: open }); },
  setDrawerOpen(open) { set({ drawerOpen: open }); },
  setActiveTab(tab) { set({ activeTab: tab }); },

  startPickingLocation() { set({ pickingLocation: true, pickingResult: null, addOpen: false }); },
  cancelPickingLocation() { set({ pickingLocation: false }); },
  confirmPickingLocation(c) { set({ pickingLocation: false, pickingResult: c, addOpen: true }); },

  setSearch(q) {
    const f = { ...get().filters, search: q };
    set({ filters: f });
  },
  togglePet(p) {
    const f = get().filters;
    const next = new Set(f.pet_types);
    if (next.has(p)) next.delete(p); else next.add(p);
    set({ filters: { ...f, pet_types: next } });
  },
  setPet(p) {
    const f = get().filters;
    const next = new Set<PetType>();
    if (p) next.add(p);
    set({ filters: { ...f, pet_types: next } });
  },
  toggleCategory(c) {
    const f = get().filters;
    const next = new Set(f.categories);
    if (next.has(c)) next.delete(c); else next.add(c);
    set({ filters: { ...f, categories: next } });
  },
  toggleCondition(k) {
    const f = get().filters;
    const next = new Set(f.conditions);
    if (next.has(k as never)) next.delete(k as never); else next.add(k as never);
    set({ filters: { ...f, conditions: next } });
  },
  toggleSize(s) {
    const f = get().filters;
    const next = new Set(f.sizes);
    if (next.has(s)) next.delete(s); else next.add(s);
    set({ filters: { ...f, sizes: next } });
  },
  setMinRating(r) { set({ filters: { ...get().filters, min_rating: r } }); },
  resetFilters() { set({ filters: initialFilters() }); },
  setSort(s) { set({ sortBy: s }); },
  setMapBounds(b) { set({ mapBounds: b }); },

  getFiltered() {
    const { places, filters: f, sortBy, userLocation, activeTab, favorites, user, mapBounds } = get();
    let list = places.slice();

    if (activeTab === "favorites") {
      list = list.filter((p) => favorites.includes(p.id));
    } else if (activeTab === "myreviews" && user) {
      const ids = new Set(reviewsApi.byUser(user.id).map((r) => r.place_id));
      list = list.filter((p) => ids.has(p.id));
    }

    if (f.search) {
      const q = f.search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.notes ?? "").toLowerCase().includes(q),
      );
    }
    if (f.pet_types.size) {
      list = list.filter((p) => Array.from(f.pet_types).every((t) => p.pet_types.includes(t)));
    }
    if (f.categories.size) {
      list = list.filter((p) => f.categories.has(p.category));
    }
    if (f.conditions.size) {
      list = list.filter((p) => {
        const pol = p.policy;
        if (f.conditions.has("no_carrier" as never) && pol.carrier_required) return false;
        if (f.conditions.has("indoor" as never) && !pol.indoor_allowed) return false;
        if (f.conditions.has("ac" as never) && !pol.ac) return false;
        if (f.conditions.has("verified" as never) && !pol.verified) return false;
        if (f.conditions.has("pet_zone" as never) && !pol.pet_zone) return false;
        return true;
      });
    }
    if (f.sizes.size) {
      const order: Record<string, number> = { small: 1, medium: 2, large: 3, any: 4 };
      list = list.filter((p) => Array.from(f.sizes).every((s) => order[p.policy.size_limit] >= order[s]));
    }
    if (f.min_rating > 0) {
      list = list.filter((p) => p.rating >= f.min_rating);
    }

    if (mapBounds) {
      list = list.filter(
        (p) =>
          p.lat >= mapBounds.south &&
          p.lat <= mapBounds.north &&
          p.lng >= mapBounds.west &&
          p.lng <= mapBounds.east,
      );
    }

    const me = userLocation ?? null;
    if (sortBy === "distance" && me) {
      list = list
        .map((p) => ({ p, d: distanceKm(me, p) }))
        .sort((a, b) => a.d - b.d)
        .map((x) => x.p);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "review_count") {
      list.sort((a, b) => b.review_count - a.review_count);
    } else if (sortBy === "newest") {
      list.sort((a, b) => (b.added_at ?? "").localeCompare(a.added_at ?? ""));
    }

    return list;
  },

  reviewsFor(placeId) {
    return reviewsApi.byPlace(placeId);
  },
}));
