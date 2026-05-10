import L from "leaflet";
import type { Place } from "@/lib/types";

export function petMarkerIcon(place: Place): L.DivIcon {
  const klass =
    place.pet_types.length === 2 ? "both" : place.pet_types.includes("cat") ? "cat" : "dog";
  const emoji =
    place.pet_types.length === 2 ? "🐾" : place.pet_types.includes("cat") ? "🐱" : "🐶";
  return L.divIcon({
    className: "pet-pin-wrap",
    html: `<div class="pet-pin ${klass}"><div class="body"></div><div class="face">${emoji}</div></div>`,
    iconSize: [44, 54],
    iconAnchor: [22, 54],
    popupAnchor: [0, -50],
  });
}

export function userMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "user-marker-wrap",
    html: '<div class="user-marker"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function selectedHaloIcon(): L.DivIcon {
  return L.divIcon({
    className: "halo-wrap",
    html: '<div style="position:relative;width:80px;height:80px"><div style="position:absolute;inset:0;background:radial-gradient(circle, hsl(348 100% 73% / 0.35) 0%, transparent 70%);border-radius:50%;animation: pulse-ring 2s infinite"></div></div>',
    iconSize: [80, 80],
    iconAnchor: [40, 40],
  });
}
