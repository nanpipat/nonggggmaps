"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";
import MapMount from "@/components/map/MapMount";
import { TopBar } from "@/components/layout/TopBar";
import { CategoryChips } from "@/components/search/CategoryChips";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomSheetPanel } from "@/components/sheets/BottomSheetPanel";
import { PlaceMiniCard } from "@/components/places/PlaceMiniCard";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { FabStack } from "@/components/layout/FabStack";
import { SideDrawer } from "@/components/layout/SideDrawer";
import { FilterModal } from "@/components/modals/FilterModal";
import { AddPlaceModal } from "@/components/modals/AddPlaceModal";
import { ReviewModal } from "@/components/modals/ReviewModal";
import { LoginModal } from "@/components/modals/LoginModal";
import { PickingBanner } from "@/components/map/PickingBanner";

export function AppShell() {
  const hydrate = useApp((s) => s.hydrate);
  const setUserLocation = useApp((s) => s.setUserLocation);
  const detailOpen = useApp((s) => s.detailOpen);
  const selectPlace = useApp((s) => s.selectPlace);
  const openDetail = useApp((s) => s.openDetail);
  const places = useApp((s) => s.places);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { timeout: 5000, maximumAge: 600_000 },
    );
  }, [setUserLocation]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get("place");
    if (placeId && places.length > 0) {
      const exists = places.find((p) => p.id === placeId);
      if (exists) {
        selectPlace(placeId);
        openDetail();
      }
    }
  }, [places, selectPlace, openDetail]);

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-background">
      <aside className="z-10 hidden md:flex md:w-[420px] md:shrink-0 md:flex-col md:border-r md:border-white/10 lg:w-[460px] 2xl:w-[500px]">
        <Sidebar />
      </aside>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <MapMount />

        <div className="md:hidden">
          <TopBar />
          <CategoryChips />
        </div>

        <FabStack />
        <PickingBanner />

        <div className="md:hidden">
          <PlaceMiniCard />
          <BottomSheetPanel />
        </div>

        {detailOpen && (
          <div className="absolute inset-x-0 bottom-0 z-40 flex h-[90dvh] animate-slide-up flex-col overflow-hidden rounded-t-2xl border border-b-0 border-white/10 bg-background shadow-soft-xl md:hidden">
            <PlaceDetail />
          </div>
        )}
      </div>

      <SideDrawer />
      <FilterModal />
      <AddPlaceModal />
      <ReviewModal />
      <LoginModal />
    </main>
  );
}
