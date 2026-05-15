"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Plus, MapPin, Loader2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Place } from "@/lib/types";

interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string]; // south, north, west, east
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

export function TopBar() {
  const filters = useApp((s) => s.filters);
  const setSearch = useApp((s) => s.setSearch);
  const user = useApp((s) => s.user);
  const setDrawerOpen = useApp((s) => s.setDrawerOpen);
  const setAddOpen = useApp((s) => s.setAddOpen);
  const selectPlace = useApp((s) => s.selectPlace);
  const openDetail = useApp((s) => s.openDetail);
  const places = useApp((s) => s.places);

  const [focused, setFocused] = useState(false);
  const [geoResults, setGeoResults] = useState<NominatimResult[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(filters.search, 400);

  // Show loading immediately when user types (before debounce fires)
  useEffect(() => {
    if (filters.search.trim().length >= 2) setGeoLoading(true);
    else { setGeoLoading(false); setGeoResults([]); }
  }, [filters.search]);

  // Matching places from the app's own data
  const matchingPlaces = useMemo<Place[]>(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return [];
    return places
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.district ?? "").toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [places, filters.search]);

  // Nominatim geocoding
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
      { signal: ctrl.signal, headers: { "User-Agent": "PawMap/1.0" } }
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

  const hasResults = matchingPlaces.length > 0 || geoResults.length > 0;
  const showDropdown = focused && filters.search.trim().length >= 1;

  function handleSelectGeoResult(r: NominatimResult) {
    setSearch("");
    setGeoResults([]);
    setFocused(false);
    inputRef.current?.blur();
    const bb = r.boundingbox; // [south, north, west, east]
    getPawMap()?.flyToBounds([
      [parseFloat(bb[0]), parseFloat(bb[2])],
      [parseFloat(bb[1]), parseFloat(bb[3])],
    ]);
  }

  function handleSelectPlace(place: Place) {
    setSearch("");
    setFocused(false);
    inputRef.current?.blur();
    selectPlace(place.id);
    openDetail();
  }

  return (
    <header className="absolute left-0 right-0 top-0 z-30 px-4 pt-safe sm:px-5">
      <div className="mx-auto mt-3 flex max-w-2xl flex-col gap-3">
        {/* Search row */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border-2 border-foreground bg-card px-4 shadow-soft-md">
            <Search className="size-[17px] shrink-0 text-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="ค้นหาสถานที่ ถนน หรือย่าน…"
              className="h-full w-full bg-transparent text-[15px] font-semibold outline-none placeholder:text-muted-foreground"
            />
            {filters.search ? (
              <button
                onClick={() => {
                  setSearch("");
                  setGeoResults([]);
                }}
                className="rounded-md border-2 border-transparent p-1 text-foreground transition hover:border-foreground hover:bg-secondary"
                aria-label="clear"
              >
                <X className="size-4" />
              </button>
            ) : (
              <button
                onClick={() => setAddOpen(true)}
                className="rounded-md border-2 border-transparent p-1 text-foreground transition hover:border-foreground hover:bg-primary"
                aria-label="เพิ่มสถานที่"
              >
                <Plus className="size-4" />
              </button>
            )}
          </div>

          {/* Avatar → opens drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="size-12 shrink-0 overflow-hidden rounded-lg border-2 border-foreground bg-secondary shadow-soft-md transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
            aria-label="เมนู"
          >
            <Avatar className="size-full">
              <AvatarFallback className="text-sm">
                {user?.avatar ?? "G"}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showDropdown && (
          <div className="overflow-hidden rounded-lg border-2 border-foreground bg-card shadow-soft-lg">
            {/* App places */}
            {matchingPlaces.length > 0 && (
              <section>
                <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  สถานที่ใน PawMap
                </p>
                {matchingPlaces.map((place) => (
                  <button
                    key={place.id}
                    onMouseDown={() => handleSelectPlace(place)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold transition-colors hover:bg-secondary active:bg-secondary"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-primary text-base shadow-soft">
                      {CATEGORY_EMOJI[place.category] ?? "🐾"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium leading-tight">
                        {place.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {place.district ?? place.address}
                      </p>
                    </div>
                  </button>
                ))}
              </section>
            )}

            {/* Geocoded locations */}
            {geoResults.length > 0 && (
              <section className={matchingPlaces.length > 0 ? "border-t-2 border-foreground" : ""}>
                <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold transition-colors hover:bg-secondary active:bg-secondary"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-muted shadow-soft">
                        <MapPin className="size-4 text-foreground" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-tight">
                          {title}
                        </p>
                        {subtitle && (
                          <p className="truncate text-xs text-muted-foreground">
                            {subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </section>
            )}

            {/* Loading state */}
            {geoLoading && (
              <div className={`flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold text-muted-foreground ${hasResults ? "border-t-2 border-foreground" : ""}`}>
                <Loader2 className="size-4 animate-spin" />
                <span>กำลังค้นหาตำแหน่ง…</span>
              </div>
            )}

            {/* No results */}
            {!geoLoading && !hasResults && (
              <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                ไม่พบผลลัพธ์
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
