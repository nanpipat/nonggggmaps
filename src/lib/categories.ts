import type { PlaceCategory } from "./types";

export interface CategoryMeta {
  id: PlaceCategory;
  label: string;
  emoji: string;
  color: string; // Tailwind text class
  bg: string; // Tailwind bg class
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "cafe",       label: "คาเฟ่",      emoji: "☕", color: "text-amber-700",   bg: "bg-amber-100" },
  { id: "restaurant", label: "ร้านอาหาร",  emoji: "🍽",  color: "text-rose-700",    bg: "bg-rose-100" },
  { id: "hotel",      label: "โรงแรม",     emoji: "🏨", color: "text-sky-700",     bg: "bg-sky-100" },
  { id: "mall",       label: "ห้าง",       emoji: "🏬", color: "text-violet-700",  bg: "bg-violet-100" },
  { id: "park",       label: "สวน",        emoji: "🌳", color: "text-emerald-700", bg: "bg-emerald-100" },
  { id: "petshop",    label: "ร้านสัตว์เลี้ยง", emoji: "🐾", color: "text-pink-700", bg: "bg-pink-100" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<PlaceCategory, CategoryMeta>;

export const CONDITION_LABELS: Record<string, { emoji: string; label: string }> = {
  no_carrier: { emoji: "🆓", label: "ไม่ต้องใส่กระเป๋า" },
  indoor: { emoji: "🏠", label: "น้องเข้าในร้านได้" },
  ac: { emoji: "❄️", label: "มีแอร์เย็นๆ" },
  pet_zone: { emoji: "🐾", label: "มีโซนน้อง" },
  verified: { emoji: "✅", label: "ข้อมูลยืนยันแล้ว" },
};

export const SIZE_LABELS: Record<string, { emoji: string; label: string }> = {
  small: { emoji: "🐶", label: "เล็ก (<10kg)" },
  medium: { emoji: "🐕", label: "กลาง (10-25kg)" },
  large: { emoji: "🦮", label: "ใหญ่ (>25kg)" },
  any: { emoji: "🐾", label: "ทุกขนาด" },
};
