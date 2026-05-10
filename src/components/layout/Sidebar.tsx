"use client";

import { Search, X, SlidersHorizontal, ArrowLeft, Plus } from "lucide-react";
import { useApp } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { CATEGORIES } from "@/lib/categories";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { cn } from "@/lib/utils";
import type { PetType } from "@/lib/types";

const PET_CHIPS = [
  { value: null,        label: "ทั้งหมด", emoji: "🐾" },
  { value: "dog" as PetType, label: "น้องหมา", emoji: "🐶" },
  { value: "cat" as PetType, label: "น้องแมว", emoji: "🐱" },
];

const TABS = [
  { id: "explore"   as const, label: "สำรวจ"   },
  { id: "favorites" as const, label: "ที่ชอบ"  },
  { id: "myreviews" as const, label: "รีวิวฉัน" },
];

export function Sidebar() {
  const filters      = useApp((s) => s.filters);
  const setSearch    = useApp((s) => s.setSearch);
  const setPet       = useApp((s) => s.setPet);
  const toggleCat    = useApp((s) => s.toggleCategory);
  const setFilterOpen= useApp((s) => s.setFilterOpen);
  const setAddOpen   = useApp((s) => s.setAddOpen);
  const setDrawerOpen= useApp((s) => s.setDrawerOpen);
  const user         = useApp((s) => s.user);
  const filtered     = useApp(useShallow((s) => s.getFiltered()));
  const sortBy       = useApp((s) => s.sortBy);
  const setSort      = useApp((s) => s.setSort);
  const activeTab    = useApp((s) => s.activeTab);
  const setActiveTab = useApp((s) => s.setActiveTab);
  const selectedId   = useApp((s) => s.selectedPlaceId);
  const closeDetail  = useApp((s) => s.closeDetail);
  const selectPlace  = useApp((s) => s.selectPlace);

  const activePet =
    filters.pet_types.size === 0 ? null
    : (filters.pet_types.has("dog") && filters.pet_types.has("cat")) ? null
    : filters.pet_types.has("dog") ? "dog" : "cat";

  const filterCount =
    filters.pet_types.size + filters.categories.size +
    filters.conditions.size + filters.sizes.size +
    (filters.min_rating > 0 ? 1 : 0);

  return (
    <div className="flex h-full flex-col bg-background">

      {/* ── Search bar (always visible) ── */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-5">
        <button
          onClick={() => setDrawerOpen(true)}
          className="size-9 shrink-0 overflow-hidden rounded-full border border-border/50 shadow-soft transition hover:shadow-soft-md active:scale-95"
          aria-label="เมนู"
        >
          <Avatar className="size-full">
            <AvatarFallback className="text-[11px]">{user?.avatar ?? "G"}</AvatarFallback>
          </Avatar>
        </button>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาร้านที่พาน้องไปได้…"
            className="h-10 w-full rounded-xl border border-border/60 bg-muted/30 pl-9 pr-8 text-[14px] outline-none transition placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-white"
          />
          {filters.search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setFilterOpen(true)}
          className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground transition hover:bg-muted"
          aria-label="ตัวกรอง"
        >
          <SlidersHorizontal className="size-[15px]" />
          {filterCount > 0 && (
            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-1 ring-background">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {selectedId ? (
        /* ════════════════════════════════
           Detail view (place selected)
           ════════════════════════════════ */
        <div className="flex flex-1 flex-col overflow-hidden">
          <button
            onClick={closeDetail}
            className="flex shrink-0 items-center gap-1.5 px-4 py-2 text-[13px] text-muted-foreground transition hover:text-foreground"
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
            className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-4 pb-3"
            style={{ scrollbarWidth: "none" }}
          >
            {PET_CHIPS.map((c) => (
              <button
                key={c.label}
                onClick={() => setPet(c.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-all active:scale-95",
                  activePet === c.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent bg-muted/50 text-muted-foreground hover:border-border/60 hover:text-foreground",
                )}
              >
                <span>{c.emoji}</span><span>{c.label}</span>
              </button>
            ))}
            <span className="mx-0.5 h-3.5 w-px shrink-0 bg-border/60" />
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-all active:scale-95",
                  filters.categories.has(c.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent bg-muted/50 text-muted-foreground hover:border-border/60 hover:text-foreground",
                )}
              >
                <span>{c.emoji}</span><span>{c.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-border/60" />

          {/* Tabs + sort */}
          <div className="flex items-center gap-2 px-4 py-2.5">
            <div className="flex flex-1 items-center gap-0.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[13px] font-semibold transition-colors",
                    activeTab === t.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
              <span className="ml-1.5 text-[11px] text-muted-foreground/60">
                {filtered.length} แห่ง
              </span>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSort(v as typeof sortBy)}>
              <SelectTrigger className="h-7 w-[100px] rounded-xl border-border/50 text-[11px]">
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
          <div className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl">🐾</div>
                <h4 className="mt-2 font-bold">ไม่พบสถานที่</h4>
                <p className="mt-1 text-[13px] text-muted-foreground">ลองปรับตัวกรอง</p>
              </div>
            ) : (
              filtered.map((p) => (
                <PlaceCard key={p.id} place={p} onClick={() => selectPlace(p.id)} />
              ))
            )}
          </div>

          {/* Add place */}
          <div className="border-t border-border/60 px-4 py-3">
            <button
              onClick={() => setAddOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-2.5 text-[13px] text-muted-foreground transition hover:border-primary/40 hover:text-primary"
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
