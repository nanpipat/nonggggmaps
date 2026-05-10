import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(km: number): string {
  if (km < 0.1) return `${Math.round(km * 1000)} m`;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function formatRating(r: number): string {
  return r.toFixed(1);
}

export function pluralizeTH(n: number, singular: string): string {
  return `${n.toLocaleString()} ${singular}`;
}

export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function relativeTimeTH(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < 60_000) return "เมื่อสักครู่";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)} นาทีก่อน`;
  if (diff < day) return `${Math.floor(diff / (60 * 60_000))} ชม.ก่อน`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} วันก่อน`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}
