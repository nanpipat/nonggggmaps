"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowLeft,
  Plus,
  MapPin,
  Loader2,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { CATEGORIES } from "@/lib/categories";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { cn } from "@/lib/utils";
import type { PetType, Place } from "@/lib/types";

interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
}

type PawMap = {
  flyTo: (lat: number, lng: number, z?: number) => void;
  flyToBounds: (bounds: [[number, number], [number, number]]) => void;
  getCenter: () => { lat: number; lng: number } | null;
};

function getPawMap(): PawMap | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { __pawmap?: PawMap }).__pawmap;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const CATEGORY_EMOJI: Record<string, string> = {
  cafe: "☕",
  restaurant: "🍽️",
  hotel: "🏨",
  mall: "🛍️",
  park: "🌳",
  petshop: "🐾",
};

const PET_CHIPS = [
  { value: null, label: "ทั้งหมด", emoji: "🐾" },
  { value: "dog" as PetType, label: "น้องหมา", emoji: "🐶" },
  { value: "cat" as PetType, label: "น้องแมว", emoji: "🐱" },
  { value: "other" as PetType, label: "อื่นๆ", emoji: "🐰" },
];

const TABS = [
  { id: "explore" as const, label: "สำรวจ" },
  { id: "favorites" as const, label: "ที่ชอบ" },
  { id: "myreviews" as const, label: "รีวิวฉัน" },
];

export function Sidebar() {
  const filters = useApp((s) => s.filters);
  const setSearch = useApp((s) => s.setSearch);
  const setPet = useApp((s) => s.setPet);
  const toggleCat = useApp((s) => s.toggleCategory);
  const setFilterOpen = useApp((s) => s.setFilterOpen);
  const setAddOpen = useApp((s) => s.setAddOpen);
  const setLoginModalOpen = useApp((s) => s.setLoginModalOpen);
  const setDrawerOpen = useApp((s) => s.setDrawerOpen);
  const user = useApp((s) => s.user);

  const isGuest = user?.provider === "guest";
  const filtered = useApp(useShallow((s) => s.getFiltered()));
  const sortBy = useApp((s) => s.sortBy);
  const setSort = useApp((s) => s.setSort);
  const activeTab = useApp((s) => s.activeTab);
  const setActiveTab = useApp((s) => s.setActiveTab);
  const selectedId = useApp((s) => s.selectedPlaceId);
  const closeDetail = useApp((s) => s.closeDetail);
  const selectPlace = useApp((s) => s.selectPlace);
  const openDetail = useApp((s) => s.openDetail);
  const places = useApp((s) => s.places);

  const [searchFocused, setSearchFocused] = useState(false);
  const [geoResults, setGeoResults] = useState<NominatimResult[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(filters.search, 400);

  useEffect(() => {
    if (filters.search.trim().length >= 2) setGeoLoading(true);
    else {
      setGeoLoading(false);
      setGeoResults([]);
    }
  }, [filters.search]);

  const matchingPlaces = useMemo<Place[]>(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return [];
    return places
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.district ?? "").toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q),
      )
      .slice(0, 4);
  }, [places, filters.search]);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setGeoResults([]);
      return;
    }
    const ctrl = new AbortController();
    setGeoLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=th&accept-language=th,en`,
      { signal: ctrl.signal, headers: { "User-Agent": "PawMap/1.0" } },
    )
      .then((r) => r.json())
      .then((data: NominatimResult[]) => {
        setGeoResults(data);
        setGeoLoading(false);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setGeoLoading(false);
      });
    return () => ctrl.abort();
  }, [debouncedQuery]);

  const hasSearchResults = matchingPlaces.length > 0 || geoResults.length > 0;
  const showSearchDropdown = searchFocused && filters.search.trim().length >= 2;

  function handleSelectGeoResult(r: NominatimResult) {
    setSearch("");
    setGeoResults([]);
    setSearchFocused(false);
    searchInputRef.current?.blur();
    const bb = r.boundingbox;
    getPawMap()?.flyToBounds([
      [parseFloat(bb[0]), parseFloat(bb[2])],
      [parseFloat(bb[1]), parseFloat(bb[3])],
    ]);
  }

  function handleSelectPlace(place: Place) {
    setSearch("");
    setSearchFocused(false);
    searchInputRef.current?.blur();
    selectPlace(place.id);
    openDetail();
  }

  const activePet =
    filters.pet_types.size === 0
      ? null
      : filters.pet_types.has("dog") && filters.pet_types.has("cat")
        ? null
        : filters.pet_types.has("dog")
          ? "dog"
          : "cat";

  const filterCount =
    filters.pet_types.size +
    filters.categories.size +
    filters.conditions.size +
    filters.sizes.size +
    (filters.min_rating > 0 ? 1 : 0);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ── Search bar (always visible) ── */}
      <div className="flex items-center gap-3 px-5 pb-4 pt-5 lg:px-6">
        <button
          onClick={() => setDrawerOpen(true)}
          className="size-10 shrink-0 overflow-hidden rounded-lg border-2 border-foreground bg-secondary shadow-soft transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
          aria-label="เมนู"
        >
          <Avatar className="size-full">
            <AvatarFallback className="text-[11px]">
              {user?.avatar ?? "G"}
            </AvatarFallback>
          </Avatar>
        </button>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="ค้นหาสถานที่ ถนน หรือย่าน…"
            className="h-10 w-full rounded-lg border-2 border-foreground bg-card pl-9 pr-8 text-[14px] font-semibold outline-none shadow-soft transition placeholder:text-muted-foreground focus:bg-muted"
          />
          {filters.search ? (
            <button
              onClick={() => {
                setSearch("");
                setGeoResults([]);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border-2 border-transparent p-0.5 text-foreground hover:border-foreground hover:bg-secondary"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <button
          onClick={() => setFilterOpen(true)}
          className="relative flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-card text-foreground shadow-soft transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
          aria-label="ตัวกรอง"
        >
          <SlidersHorizontal className="size-[15px]" />
          {filterCount > 0 && (
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-md border-2 border-foreground bg-secondary text-[9px] font-black text-secondary-foreground">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Search suggestions dropdown ── */}
      {showSearchDropdown && (
        <div className="mx-5 mb-4 overflow-hidden rounded-lg border-2 border-foreground bg-card shadow-soft-md lg:mx-6">
          {matchingPlaces.length > 0 && (
            <section>
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                สถานที่ใน PawMap
              </p>
              {matchingPlaces.map((place) => (
                <button
                  key={place.id}
                  onMouseDown={() => handleSelectPlace(place)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left font-semibold transition-colors hover:bg-secondary active:bg-secondary"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-primary text-sm shadow-soft">
                    {CATEGORY_EMOJI[place.category] ?? "🐾"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium leading-tight">
                      {place.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {place.district ?? place.address}
                    </p>
                  </div>
                </button>
              ))}
            </section>
          )}

          {geoResults.length > 0 && (
            <section
              className={
                matchingPlaces.length > 0 ? "border-t-2 border-foreground" : ""
              }
            >
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                ตำแหน่งบนแผนที่
              </p>
              {geoResults.map((r) => {
                const parts = r.display_name.split(",");
                const title = r.name || parts[0];
                const subtitle = parts.slice(1, 3).join(", ").trim();
                return (
                  <button
                    key={r.place_id}
                    onMouseDown={() => handleSelectGeoResult(r)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left font-semibold transition-colors hover:bg-secondary active:bg-secondary"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-muted shadow-soft">
                      <MapPin className="size-3.5 text-foreground" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium leading-tight">
                        {title}
                      </p>
                      {subtitle && (
                        <p className="truncate text-[11px] text-muted-foreground">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {geoLoading && (
            <div
              className={`flex items-center justify-center gap-2 px-3 py-3 text-[13px] font-bold text-muted-foreground ${hasSearchResults ? "border-t-2 border-foreground" : ""}`}
            >
              <Loader2 className="size-3.5 animate-spin" />
              <span>กำลังค้นหาตำแหน่ง…</span>
            </div>
          )}

          {!geoLoading && !hasSearchResults && (
            <div className="px-3 py-3 text-center text-[13px] text-muted-foreground">
              ไม่พบผลลัพธ์
            </div>
          )}
        </div>
      )}

      {selectedId ? (
        /* ════════════════════════════════
           Detail view (place selected)
           ════════════════════════════════ */
        <div className="flex flex-1 flex-col overflow-hidden">
          <button
            onClick={closeDetail}
            className="mx-5 mb-4 mt-1 flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-foreground bg-card px-3 py-2 text-[13px] font-black text-foreground shadow-soft transition hover:bg-secondary active:translate-x-1 active:translate-y-1 active:shadow-none lg:mx-6"
          >
            <ArrowLeft className="size-4" />
            กลับไปรายการ
          </button>
          <div className="flex-1 overflow-y-auto">
            <PlaceDetail sidebar />
          </div>
        </div>
      ) : (
        /* ════════════════════════════════
           List view
           ════════════════════════════════ */
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Category chips */}
          <div
            className="no-scrollbar flex items-center gap-2 overflow-x-auto px-5 pb-5 pt-1 lg:px-6"
            style={{ scrollbarWidth: "none" }}
          >
            {PET_CHIPS.map((c) => (
              <button
                key={c.label}
                onClick={() => setPet(c.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-md border-2 px-2.5 py-1 text-[12px] font-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none",
                  activePet === c.value
                    ? "border-foreground bg-primary text-primary-foreground shadow-soft"
                    : "border-foreground bg-card text-foreground shadow-soft hover:bg-secondary",
                )}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
            <span className="mx-0.5 h-5 w-0.5 shrink-0 bg-foreground" />
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-md border-2 px-2.5 py-1 text-[12px] font-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none",
                  filters.categories.has(c.id)
                    ? "border-foreground bg-accent text-accent-foreground shadow-soft"
                    : "border-foreground bg-card text-foreground shadow-soft hover:bg-secondary",
                )}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div className="h-0.5 bg-foreground" />

          {/* Tabs + sort */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 lg:px-6">
            <div className="flex min-w-[220px] flex-1 flex-wrap items-center gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id !== "explore" && isGuest) {
                      setLoginModalOpen(true);
                    } else {
                      setActiveTab(t.id);
                    }
                  }}
                  className={cn(
                    "rounded-md border-2 px-3 py-1 text-[13px] font-black transition-all",
                    activeTab === t.id
                      ? "border-foreground bg-secondary text-secondary-foreground shadow-soft"
                      : "border-transparent text-foreground hover:border-foreground hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
              <span className="ml-1 text-[11px] font-bold text-muted-foreground/70">
                {filtered.length} แห่ง
              </span>
            </div>
            <Select
              value={sortBy}
              onValueChange={(v) => setSort(v as typeof sortBy)}
            >
              <SelectTrigger className="h-9 w-[128px] rounded-md text-[11px] shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">ใกล้ฉัน</SelectItem>
                <SelectItem value="rating">คะแนนสูงสุด</SelectItem>
                <SelectItem value="review_count">รีวิวเยอะสุด</SelectItem>
                <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Place list */}
          <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6 pr-7 pt-1 lg:px-6 lg:pr-8">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl">🐾</div>
                <h4 className="mt-2 font-bold">ไม่พบสถานที่</h4>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  ลองปรับตัวกรอง
                </p>
              </div>
            ) : (
              filtered.map((p) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  onClick={() => selectPlace(p.id)}
                />
              ))
            )}
          </div>

          {/* Add place */}
          <div className="border-t-2 border-foreground px-5 py-4 lg:px-6">
            <button
              onClick={() => {
                if (isGuest) {
                  setLoginModalOpen(true);
                } else {
                  setAddOpen(true);
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-foreground bg-card py-2.5 text-[13px] font-black text-foreground shadow-soft transition-all hover:bg-primary active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Plus className="size-4" />
              เพิ่มสถานที่ใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
