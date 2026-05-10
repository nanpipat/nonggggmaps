"use client";

import { Crosshair, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { flyTo } from "@/lib/map-helpers";

export function FabStack() {
  const setFilterOpen = useApp((s) => s.setFilterOpen);
  const setUserLocation = useApp((s) => s.setUserLocation);
  const filters = useApp((s) => s.filters);

  const filterCount =
    filters.pet_types.size +
    filters.categories.size +
    filters.conditions.size +
    filters.sizes.size +
    (filters.min_rating > 0 ? 1 : 0);

  const onLocate = () => {
    if (!navigator.geolocation) {
      toast.error("เบราว์เซอร์ไม่รองรับตำแหน่ง");
      return;
    }
    toast.loading("กำลังค้นหาตำแหน่ง…", { id: "locate" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(c);
        flyTo(c.lat, c.lng, 15);
        toast.success("พบตำแหน่งของคุณแล้ว", { id: "locate" });
      },
      (err) =>
        toast.error("ไม่สามารถค้นหาตำแหน่งได้: " + err.message, { id: "locate" }),
      { enableHighAccuracy: true, timeout: 7000 },
    );
  };

  return (
    <div className="absolute bottom-24 right-3 z-30 flex flex-col gap-2 md:bottom-6">
      <button onClick={onLocate} className="fab" aria-label="ค้นหาตำแหน่งของฉัน">
        <Crosshair className="size-5" />
      </button>

      <button onClick={() => setFilterOpen(true)} className="fab relative" aria-label="ตัวกรอง">
        <SlidersHorizontal className="size-5" />
        {filterCount > 0 ? (
          <span
            className={cn(
              "absolute -right-1 -top-1 grid size-5 place-items-center rounded-full",
              "bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-card",
            )}
          >
            {filterCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
