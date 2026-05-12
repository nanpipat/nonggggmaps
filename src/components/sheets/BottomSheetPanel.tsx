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
  half: "h-[48dvh]",
  full: "h-[calc(100dvh-80px)]",
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
        "sheet-snap absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-3xl flex-col",
        "rounded-t-3xl border border-b-0 border-border/60 bg-card shadow-soft-xl pb-safe",
        SNAP_HEIGHTS[snap],
      )}
    >
      {/* Drag handle */}
      <button
        onClick={cycleSnap}
        className="flex w-full items-center justify-center py-2.5"
        aria-label="ขยายรายการ"
      >
        <span className="h-1 w-10 rounded-full bg-border/70" />
      </button>

      {/* Header: tabs + count + sort in one row */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="flex flex-1 items-center gap-0.5">
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
                "rounded-full px-3 py-1 text-[13px] font-semibold transition-colors",
                activeTab === t.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-1.5 text-[11px] text-muted-foreground/70">
            {filtered.length.toLocaleString()} แห่ง
            {mapBounds ? " · ในพื้นที่นี้" : ""}
          </span>
        </div>

        <Select
          value={sortBy}
          onValueChange={(v) => setSort(v as typeof sortBy)}
        >
          <SelectTrigger className="h-8 w-[116px] rounded-xl border-border/50 text-[12px]">
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
        className="flex-1 space-y-2 overflow-y-auto px-3 pb-4"
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
