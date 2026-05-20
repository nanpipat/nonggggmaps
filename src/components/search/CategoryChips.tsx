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
    <div className="absolute left-0 right-0 top-[calc(env(safe-area-inset-top)+72px)] z-20">
      <div
        className="no-scrollbar mx-auto flex max-w-3xl items-center gap-1.5 overflow-x-auto px-3 py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {PET_CHIPS.map((c) => (
          <button
            key={c.label}
            onClick={() => setPet(c.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all active:scale-95",
              "border backdrop-blur-sm",
              activePet === c.value
                ? "border-primary/30 bg-primary text-primary-foreground shadow-pop"
                : "border-border/50 bg-white/90 text-foreground shadow-soft hover:border-border",
            )}
          >
            <span aria-hidden className="text-[12px]">
              {c.emoji}
            </span>
            <span>{c.label}</span>
          </button>
        ))}

        <div className="mx-0.5 h-4 w-px shrink-0 bg-border/60" aria-hidden />

        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => toggleCategory(c.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all active:scale-95",
              "border backdrop-blur-sm",
              filters.categories.has(c.id)
                ? "border-primary/30 bg-primary text-primary-foreground shadow-pop"
                : "border-border/50 bg-white/90 text-foreground shadow-soft hover:border-border",
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
