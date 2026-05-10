"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { useApp } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { BANGKOK } from "@/lib/geo";
import type { Place } from "@/lib/types";
import { petMarkerIcon, userMarkerIcon } from "./marker-icons";

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ||
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

const TILE_ATTR =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/attributions">CARTO</a>';

// react-leaflet has SSR pain — using vanilla Leaflet directly with refs.
export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersByIdRef = useRef<Map<string, L.Marker>>(new Map());

  const places = useApp((s) => s.places);
  const userLocation = useApp((s) => s.userLocation);
  const filtered = useApp(useShallow((s) => s.getFiltered()));
  const selectedPlaceId = useApp((s) => s.selectedPlaceId);
  const pickingLocation = useApp((s) => s.pickingLocation);
  const selectPlace = useApp((s) => s.selectPlace);
  const confirmPickingLocation = useApp((s) => s.confirmPickingLocation);
  const setMapBounds = useApp((s) => s.setMapBounds);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Fix leaflet's default icon path for retina
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(containerRef.current, {
      center: [BANGKOK.lat, BANGKOK.lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
      tap: true,
    });

    L.tileLayer(TILE_URL, {
      maxZoom: 19,
      attribution: TILE_ATTR,
      subdomains: "abcd",
    }).addTo(map);

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 40,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
    });
    map.addLayer(cluster);

    mapRef.current = map;
    clusterRef.current = cluster;

    const syncBounds = () => {
      const b = map.getBounds();
      setMapBounds({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    };
    map.on("moveend", syncBounds);
    map.whenReady(syncBounds);

    return () => {
      map.off("moveend", syncBounds);
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markersByIdRef.current.clear();
      setMapBounds(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers with filtered places
  useEffect(() => {
    if (!clusterRef.current) return;
    const cluster = clusterRef.current;
    const markers = markersByIdRef.current;
    const wantedIds = new Set(filtered.map((p) => p.id));

    // Remove markers no longer wanted
    markers.forEach((m, id) => {
      if (!wantedIds.has(id)) {
        cluster.removeLayer(m);
        markers.delete(id);
      }
    });

    // Add or update markers
    filtered.forEach((p: Place) => {
      const existing = markers.get(p.id);
      if (existing) {
        existing.setLatLng([p.lat, p.lng]);
      } else {
        const marker = L.marker([p.lat, p.lng], { icon: petMarkerIcon(p) });
        marker.on("click", () => selectPlace(p.id));
        markers.set(p.id, marker);
        cluster.addLayer(marker);
      }
    });
  }, [filtered, selectPlace, places]);

  // User location marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const m = L.marker([userLocation.lat, userLocation.lng], {
        icon: userMarkerIcon(),
        zIndexOffset: 1000,
      });
      m.addTo(mapRef.current);
      userMarkerRef.current = m;
    }
  }, [userLocation]);

  // Fly to selected place
  useEffect(() => {
    if (!mapRef.current || !selectedPlaceId) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;
    mapRef.current.flyTo([place.lat, place.lng], 16, { duration: 0.6 });
  }, [selectedPlaceId, places]);

  // Picking-mode click handler
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const handler = (e: L.LeafletMouseEvent) => {
      if (pickingLocation) {
        confirmPickingLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [pickingLocation, confirmPickingLocation]);

  // expose imperative helpers via window for FAB buttons
  useEffect(() => {
    if (typeof window === "undefined") return;
    (
      window as unknown as {
        __pawmap?: {
          flyTo: (lat: number, lng: number, z?: number) => void;
          getCenter: () => L.LatLng | null;
        };
      }
    ).__pawmap = {
      flyTo: (lat, lng, z = 15) =>
        mapRef.current?.flyTo([lat, lng], z, { duration: 0.6 }),
      getCenter: () => mapRef.current?.getCenter() ?? null,
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      aria-label="Map"
      role="application"
    />
  );
}

// Helpers are now in @/lib/map-helpers to avoid SSR issues
