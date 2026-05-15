"use client";

import Image from "next/image";
import { X, Navigation, ChevronRight, Star, BadgeCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { formatRating } from "@/lib/utils";
import { googleMapsDirectionsUrl } from "@/lib/geo";

export function PlaceMiniCard() {
  const selectedId  = useApp((s) => s.selectedPlaceId);
  const detailOpen  = useApp((s) => s.detailOpen);
  const places      = useApp((s) => s.places);
  const closeDetail = useApp((s) => s.closeDetail);
  const openDetail  = useApp((s) => s.openDetail);

  // Hide when no place selected, or when full detail is already open
  if (!selectedId || detailOpen) return null;

  const place = places.find((p) => p.id === selectedId);
  if (!place) return null;

  const category = CATEGORY_BY_ID[place.category];

  return (
    <div className="absolute inset-x-4 bottom-4 z-30 animate-slide-up pb-safe sm:inset-x-5">
      <div className="overflow-hidden rounded-lg border-2 border-foreground bg-card shadow-soft-xl">
        {/* Info row */}
        <div className="flex gap-3 p-3">
          <div className="relative size-[72px] shrink-0 overflow-hidden rounded-md border-2 border-foreground bg-muted">
            {place.cover_photo ? (
              <Image src={place.cover_photo} alt={place.name} fill sizes="72px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">
                {category.emoji}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-[15px] font-bold leading-snug">{place.name}</h3>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  {category.emoji} {category.label}
                </p>
              </div>
              <button
                onClick={closeDetail}
                className="shrink-0 rounded-md border-2 border-transparent p-1 text-foreground transition hover:border-foreground hover:bg-secondary"
                aria-label="ปิด"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[12px]">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{formatRating(place.rating)}</span>
              <span className="text-muted-foreground">({place.review_count} รีวิว)</span>
              {place.policy.verified && <BadgeCheck className="size-3.5 text-emerald-500" />}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {place.pet_types.includes("dog") && (
                <Badge variant="dog" className="px-1.5 py-0 text-[10px]">🐶 น้องหมา</Badge>
              )}
              {place.pet_types.includes("cat") && (
                <Badge variant="cat" className="px-1.5 py-0 text-[10px]">🐱 น้องแมว</Badge>
              )}
              {place.pet_types.includes("other") && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">🐰 อื่นๆ</Badge>
              )}
              {place.policy.indoor_allowed && (
                <Badge variant="success" className="px-1.5 py-0 text-[10px]">🏠 เข้าในร้านได้</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex gap-2 border-t-2 border-foreground px-3 py-2.5">
          <a
            href={googleMapsDirectionsUrl(place, place.name)}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-foreground bg-primary py-2 text-[13px] font-black text-primary-foreground shadow-soft transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Navigation className="size-3.5" /> นำทาง
          </a>
          <button
            onClick={openDetail}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-foreground bg-card py-2 text-[13px] font-black shadow-soft transition-all hover:bg-secondary active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            ดูรายละเอียด <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
