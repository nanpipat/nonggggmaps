"use client";

import { Search, X, Plus } from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  const filters = useApp((s) => s.filters);
  const setSearch = useApp((s) => s.setSearch);
  const user = useApp((s) => s.user);
  const setDrawerOpen = useApp((s) => s.setDrawerOpen);
  const setAddOpen = useApp((s) => s.setAddOpen);

  return (
    <header className="absolute left-0 right-0 top-0 z-30 px-3 pt-safe">
      <div className="mx-auto mt-3 flex max-w-2xl items-center gap-2">
        {/* Search pill */}
        <div className="flex h-12 flex-1 items-center gap-2 rounded-full border border-border/50 bg-white/95 px-4 shadow-soft-md backdrop-blur-sm">
          <Search className="size-[17px] shrink-0 text-muted-foreground/70" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาร้านที่พาน้องไปได้…"
            className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/60"
          />
          {filters.search ? (
            <button
              onClick={() => setSearch("")}
              className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
              aria-label="clear"
            >
              <X className="size-4" />
            </button>
          ) : (
            <button
              onClick={() => setAddOpen(true)}
              className="rounded-full p-1 text-muted-foreground/60 transition hover:text-primary"
              aria-label="เพิ่มสถานที่"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>

        {/* Avatar → opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="size-12 overflow-hidden rounded-full border-2 border-white shadow-soft-md transition hover:shadow-soft-lg active:scale-95"
          aria-label="เมนู"
        >
          <Avatar className="size-full">
            <AvatarFallback className="text-sm">
              {user?.avatar ?? "G"}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
