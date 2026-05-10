"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Leaflet uses `window`, so disable SSR completely.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 grid place-items-center bg-muted">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-sm">กำลังโหลดแผนที่…</span>
      </div>
    </div>
  ),
});

export default function MapMount() {
  return <MapView />;
}
