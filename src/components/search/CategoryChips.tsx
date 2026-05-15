"use client";

import { useApp } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

const PET_CHIPS = [
  { value: null, label: "ทั้งหมด", emoji: "🐾" },
  { value: "dog" as const, label: "น้องหมา", emoji: "🐶" },
  { value: "cat" as const, label: "น้องแมว", emoji: "🐱" },
  { value: "other" as const, label: "อื่นๆ", emoji: "🐰" },
];

export function CategoryChips() {
  const filters = useApp((s) => s.filters);
  const setPet = useApp((s) => s.setPet);
  const toggleCategory = useApp((s) => s.toggleCategory);

  const activePet =
    filters.pet_types.size === 0
      ? null
      : filters.pet_types.size === 1
        ? [...filters.pet_types][0]
        : null;

  return (
    <div className="absolute left-0 right-0 top-[calc(env(safe-area-inset-top)+80px)] z-20">
      <div
        className="no-scrollbar mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-5"
        style={{ scrollbarWidth: "none" }}
      >
        {PET_CHIPS.map((c) => (
          <button
            key={c.label}
            onClick={() => setPet(c.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-md border-2 px-3 py-1.5 text-[13px] font-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none",
              activePet === c.value
                ? "border-foreground bg-primary text-primary-foreground shadow-pop"
                : "border-foreground bg-card text-foreground shadow-soft hover:bg-secondary",
            )}
          >
            <span aria-hidden className="text-[12px]">
              {c.emoji}
            </span>
            <span>{c.label}</span>
          </button>
        ))}

        <div className="mx-0.5 h-5 w-0.5 shrink-0 bg-foreground" aria-hidden />

        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => toggleCategory(c.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-md border-2 px-3 py-1.5 text-[13px] font-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none",
              filters.categories.has(c.id)
                ? "border-foreground bg-accent text-accent-foreground shadow-pop"
                : "border-foreground bg-card text-foreground shadow-soft hover:bg-secondary",
            )}
          >
            <span aria-hidden className="text-[12px]">
              {c.emoji}
            </span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
