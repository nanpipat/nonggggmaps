import type { Coords } from "./types";

/** Haversine distance in kilometres */
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function googleMapsDirectionsUrl(p: Coords, label?: string): string {
  const q = label
    ? encodeURIComponent(`${label} @${p.lat},${p.lng}`)
    : `${p.lat},${p.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`;
}

export const BANGKOK: Coords = {
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? 13.7563),
  lng: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? 100.5018),
};
