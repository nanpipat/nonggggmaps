"use client";

import { useApp } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES, CONDITION_LABELS, SIZE_LABELS } from "@/lib/categories";
import type { Filters, PlaceCategory, PetType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PET_OPTIONS: { id: PetType; label: string; emoji: string }[] = [
  { id: "dog", label: "น้องหมา", emoji: "🐶" },
  { id: "cat", label: "น้องแมว", emoji: "🐱" },
  { id: "other", label: "สัตว์อื่นๆ", emoji: "🐰" },
];

const CONDITION_KEYS: (keyof typeof CONDITION_LABELS)[] = [
  "no_carrier",
  "indoor",
  "ac",
  "pet_zone",
  "verified",
];
const SIZE_KEYS: ("small" | "medium" | "large")[] = [
  "small",
  "medium",
  "large",
];
const RATING_OPTIONS = [
  { value: 0, label: "ทุกคะแนน" },
  { value: 3, label: "⭐ 3.0+" },
  { value: 4, label: "⭐ 4.0+" },
  { value: 4.5, label: "⭐ 4.5+" },
];

const RADIUS_OPTIONS = [
  { value: 0, label: "ทุกระยะ" },
  { value: 1, label: "📍 1 กม." },
  { value: 2, label: "📍 2 กม." },
  { value: 5, label: "📍 5 กม." },
  { value: 10, label: "📍 10 กม." },
];

export function FilterModal() {
  const open = useApp((s) => s.filterOpen);
  const setOpen = useApp((s) => s.setFilterOpen);
  const filters = useApp((s) => s.filters);
  const togglePet = useApp((s) => s.togglePet);
  const toggleCategory = useApp((s) => s.toggleCategory);
  const toggleCondition = useApp((s) => s.toggleCondition);
  const toggleSize = useApp((s) => s.toggleSize);
  const setMinRating = useApp((s) => s.setMinRating);
  const setRadius = useApp((s) => s.setRadius);
  const resetFilters = useApp((s) => s.resetFilters);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[480px] !p-0">
        <DialogHeader className="border-b border-border px-5 pb-4 pt-5">
          <DialogTitle>ตัวกรอง 🐾</DialogTitle>
          <p className="text-sm text-muted-foreground">
            เลือกเงื่อนไขที่ใช่สำหรับน้อง
          </p>
        </DialogHeader>

        <div className="space-y-5 px-5 py-5">
          <Group title="น้องของคุณ">
            <div className="flex flex-wrap gap-2">
              {PET_OPTIONS.map((p) => (
                <Pill
                  key={p.id}
                  active={filters.pet_types.has(p.id)}
                  onClick={() => togglePet(p.id)}
                >
                  <span className="mr-1">{p.emoji}</span> {p.label}
                </Pill>
              ))}
            </div>
          </Group>

          <Group title="เงื่อนไขที่น้องต้องการ">
            <div className="flex flex-wrap gap-2">
              {CONDITION_KEYS.map((k) => (
                <Pill
                  key={k}
                  active={filters.conditions.has(k as never)}
                  onClick={() => toggleCondition(k)}
                >
                  <span className="mr-1">{CONDITION_LABELS[k].emoji}</span>
                  {CONDITION_LABELS[k].label}
                </Pill>
              ))}
            </div>
          </Group>

          <Group title="ประเภทสถานที่">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Pill
                  key={c.id}
                  active={filters.categories.has(c.id as PlaceCategory)}
                  onClick={() => toggleCategory(c.id)}
                >
                  <span className="mr-1">{c.emoji}</span> {c.label}
                </Pill>
              ))}
            </div>
          </Group>

          <Group title="ขนาดน้อง">
            <div className="flex flex-wrap gap-2">
              {SIZE_KEYS.map((s) => (
                <Pill
                  key={s}
                  active={filters.sizes.has(s)}
                  onClick={() => toggleSize(s)}
                >
                  <span className="mr-1">{SIZE_LABELS[s].emoji}</span>{" "}
                  {SIZE_LABELS[s].label}
                </Pill>
              ))}
            </div>
          </Group>

          <Group title="คะแนนขั้นต่ำ">
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((r) => (
                <Pill
                  key={r.value}
                  active={filters.min_rating === r.value}
                  onClick={() => setMinRating(r.value)}
                >
                  {r.label}
                </Pill>
              ))}
            </div>
          </Group>

          <Group title="ระยะทาง">
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <Pill
                  key={r.value}
                  active={filters.radius_km === r.value}
                  onClick={() => setRadius(r.value)}
                >
                  {r.label}
                </Pill>
              ))}
            </div>
          </Group>
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <Button variant="ghost" onClick={resetFilters} className="flex-1">
            ล้างทั้งหมด
          </Button>
          <Button onClick={() => setOpen(false)} className="flex-1">
            ดูสถานที่เลย!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={cn(
        "rounded-full border border-border bg-white px-3.5 py-2 text-[13px] font-semibold transition-colors active:scale-95",
        active && "border-primary bg-primary-soft text-primary",
      )}
    >
      {children}
    </button>
  );
}
