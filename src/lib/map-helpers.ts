/**
 * Map helper functions that can be safely imported without triggering SSR issues.
 * These functions interact with the map through window.__pawmap which is set by MapView.
 */

export function flyTo(lat: number, lng: number, zoom = 15) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    __pawmap?: { flyTo: (lat: number, lng: number, z?: number) => void };
  };
  w.__pawmap?.flyTo(lat, lng, zoom);
}

export function getMapCenter(): { lat: number; lng: number } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    __pawmap?: { getCenter: () => { lat: number; lng: number } | null };
  };
  return w.__pawmap?.getCenter() ?? null;
}
