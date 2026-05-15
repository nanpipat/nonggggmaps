"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaceCard } from "@/components/places/PlaceCard";
import { cn } from "@/lib/utils";

type Snap = "peek" | "half" | "full";

const SNAP_HEIGHTS: Record<Snap, string> = {
  peek: "h-[76px]",
  half: "h-[46dvh] sm:h-[48dvh]",
  full: "h-[calc(100dvh-92px)] sm:h-[calc(100dvh-84px)]",
};

const TABS = [
  { id: "explore" as const, label: "สำรวจ" },
  { id: "favorites" as const, label: "ที่ชอบ" },
  { id: "myreviews" as const, label: "รีวิวฉัน" },
];

export function BottomSheetPanel() {
  const selectedId = useApp((s) => s.selectedPlaceId);
  const filtered = useApp(useShallow((s) => s.getFiltered()));
  const sortBy = useApp((s) => s.sortBy);
  const setSort = useApp((s) => s.setSort);
  const selectPlace = useApp((s) => s.selectPlace);
  const activeTab = useApp((s) => s.activeTab);
  const setActiveTab = useApp((s) => s.setActiveTab);
  const setLoginModalOpen = useApp((s) => s.setLoginModalOpen);
  const user = useApp((s) => s.user);
  const mapBounds = useApp((s) => s.mapBounds);

  const isGuest = user?.provider === "guest";

  const [snap, setSnap] = useState<Snap>("half");

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (snap === "peek" && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [snap]);

  // Mini card takes over when a place is selected
  if (selectedId) return null;

  const cycleSnap = () =>
    setSnap((cur) =>
      cur === "peek" ? "half" : cur === "half" ? "full" : "peek",
    );

  return (
    <section
      aria-label="Place list"
      className={cn(
        "sheet-snap absolute inset-x-4 bottom-0 z-20 mx-auto flex w-auto max-w-3xl flex-col sm:inset-x-5",
        "rounded-t-lg border-2 border-b-0 border-foreground bg-card shadow-soft-xl pb-safe",
        SNAP_HEIGHTS[snap],
      )}
    >
      {/* Drag handle */}
      <button
        onClick={cycleSnap}
        className="flex w-full items-center justify-center py-2.5"
        aria-label="ขยายรายการ"
      >
        <span className="h-1.5 w-12 rounded-sm bg-foreground" />
      </button>

      {/* Header: tabs + count + sort in one row */}
      <div className="flex flex-wrap items-center gap-3 px-4 pb-4 sm:px-5">
        <div className="flex min-w-[210px] flex-1 flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.id !== "explore" && isGuest) {
                  setLoginModalOpen(true);
                } else {
                  setActiveTab(t.id);
                  if (snap === "peek") setSnap("half");
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
            {filtered.length.toLocaleString()} แห่ง
            {mapBounds ? " · ในพื้นที่นี้" : ""}
          </span>
        </div>

        <Select
          value={sortBy}
          onValueChange={(v) => setSort(v as typeof sortBy)}
        >
          <SelectTrigger className="h-9 w-[128px] rounded-md text-[12px] shadow-none">
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

      {/* Body */}
      <div
        ref={bodyRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 pb-6 pr-6 sm:px-5 sm:pr-7"
        style={{ overscrollBehavior: "contain" }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="text-4xl">🐾</div>
            <h4 className="mt-2 font-bold">
              {activeTab === "favorites"
                ? "ยังไม่มีที่ชอบ"
                : activeTab === "myreviews"
                  ? "ยังไม่มีรีวิว"
                  : "ยังหาไม่เจอเลย"}
            </h4>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {activeTab === "favorites"
                ? "กด ❤️ ที่สถานที่ที่ชอบ จะเก็บไว้ให้ที่นี่"
                : activeTab === "myreviews"
                  ? "เขียนรีวิวแรกของคุณเลย!"
                  : "ลองซูมออกดูนะ หรือปรับตัวกรองดูก็ได้"}
            </p>
          </div>
        ) : (
          filtered.map((p) => (
            <PlaceCard key={p.id} place={p} onClick={() => selectPlace(p.id)} />
          ))
        )}
      </div>
    </section>
  );
}
