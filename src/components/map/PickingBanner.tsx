"use client";

import { MapPin } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { getMapCenter } from "@/lib/map-helpers";

/** Shows when user is picking a location for "Add place".
 *  A center pin floats over the map; user pans to position; tap "เลือก" or click anywhere on the map. */
export function PickingBanner() {
  const picking = useApp((s) => s.pickingLocation);
  const cancel = useApp((s) => s.cancelPickingLocation);
  const confirm = useApp((s) => s.confirmPickingLocation);

  if (!picking) return null;

  return (
    <>
      {/* Center pin overlay */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-full">
        <div className="relative">
          <div className="grid size-12 place-items-center rounded-full bg-primary text-2xl text-primary-foreground shadow-pop">
            📍
          </div>
          <div className="absolute left-1/2 top-full size-2 -translate-x-1/2 rounded-full bg-primary/40" />
        </div>
      </div>

      {/* Banner */}
      <div
        className="absolute left-1/2 z-30 w-[min(640px,calc(100vw-24px))] -translate-x-1/2 px-3"
        style={{ top: "calc(env(safe-area-inset-top) + 76px)" }}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary px-4 py-3 text-primary-foreground shadow-soft-lg">
          <MapPin className="size-5 shrink-0" />
          <p className="flex-1 text-[13px] font-semibold">
            เลื่อนแผนที่ไปยังตำแหน่งที่ต้องการ แล้วกดยืนยัน
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const c = getMapCenter();
              if (c) confirm({ lat: c.lat, lng: c.lng });
            }}
          >
            เลือก
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-primary-foreground hover:bg-white/10"
            onClick={cancel}
          >
            ยกเลิก
          </Button>
        </div>
      </div>
    </>
  );
}
