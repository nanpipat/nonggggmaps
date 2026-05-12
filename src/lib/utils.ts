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

export function parseOpenStatus(hours: string | null | undefined): { open: boolean; text: string } | null {
  if (!hours) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const timeRegex = /(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/g;
  let match;
  const ranges: { open: number; close: number }[] = [];

  while ((match = timeRegex.exec(hours)) !== null) {
    const openMin = parseInt(match[1]) * 60 + parseInt(match[2]);
    let closeMin = parseInt(match[3]) * 60 + parseInt(match[4]);
    if (closeMin < openMin) closeMin += 24 * 60;
    ranges.push({ open: openMin, close: closeMin });
  }

  if (ranges.length === 0) {
    if (/24\s*ชม/i.test(hours) || /24\s*hrs/i.test(hours) || /ตลอด/i.test(hours)) {
      return { open: true, text: "เปิด 24 ชม." };
    }
    if (/ปิด/i.test(hours)) {
      return { open: false, text: "ปิดชั่วคราว" };
    }
    return null;
  }

  for (const r of ranges) {
    if (currentMinutes >= r.open && currentMinutes < r.close) {
      const closeH = Math.floor(r.close % (24 * 60) / 60);
      const closeM = r.close % 60;
      return { open: true, text: `เปิดอยู่ · ปิด ${closeH.toString().padStart(2, "0")}:${closeM.toString().padStart(2, "0")} น.` };
    }
  }

  const nextOpen = ranges.find((r) => currentMinutes < r.open);
  if (nextOpen) {
    const openH = Math.floor(nextOpen.open / 60);
    const openM = nextOpen.open % 60;
    return { open: false, text: `ปิดแล้ว · เปิด ${openH.toString().padStart(2, "0")}:${openM.toString().padStart(2, "0")} น.` };
  }

  return { open: false, text: "ปิดแล้ว" };
}
