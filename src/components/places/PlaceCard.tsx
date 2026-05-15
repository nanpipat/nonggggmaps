"use client";

import Image from "next/image";
import { Star, MapPin, Heart, BadgeCheck } from "lucide-react";
import type { Place } from "@/lib/types";
import { CATEGORY_BY_ID, SIZE_LABELS } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { cn, formatDistance, formatRating } from "@/lib/utils";
import { distanceKm } from "@/lib/geo";
import { useApp } from "@/lib/store";

interface Props {
  place: Place;
  onClick?: () => void;
}

export function PlaceCard({ place, onClick }: Props) {
  const userLocation = useApp((s) => s.userLocation);
  const favorites = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const setLoginModalOpen = useApp((s) => s.setLoginModalOpen);
  const user = useApp((s) => s.user);

  const isGuest = user?.provider === "guest";

  const category = CATEGORY_BY_ID[place.category];
  const isFav = favorites.includes(place.id);
  const distance = userLocation ? distanceKm(userLocation, place) : null;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className="group flex w-full cursor-pointer gap-3 rounded-lg border-2 border-foreground bg-card p-3 text-left shadow-soft transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-soft-md active:translate-x-1 active:translate-y-1 active:shadow-none sm:gap-4"
    >
      <div className="relative size-[82px] shrink-0 overflow-hidden rounded-md border-2 border-foreground bg-muted sm:size-[96px] md:size-[104px]">
        {place.cover_photo ? (
          <Image
            src={place.cover_photo}
            alt={place.name}
            fill
            sizes="(max-width: 640px) 82px, (max-width: 768px) 96px, 104px"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            {category.emoji}
          </div>
        )}
        <div
          className={cn(
            "absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md border-2 border-foreground px-1.5 py-0.5 text-[10px] font-black shadow-soft",
            category.bg,
            category.color,
          )}
        >
          {category.emoji}
        </div>
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-[15px] leading-snug">
            {place.name}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isGuest) {
                setLoginModalOpen(true);
              } else {
                toggleFavorite(place.id);
              }
            }}
            className="-mr-1 -mt-0.5 rounded-md border-2 border-transparent p-1.5 text-foreground transition hover:border-foreground hover:bg-accent hover:text-foreground"
            aria-label={isFav ? "เอาออกจากที่ชอบ" : "บันทึกเป็นที่ชอบ"}
          >
            <Heart
              className={cn(
                "size-4 transition",
                isFav && "fill-rose-500 text-rose-500",
              )}
            />
          </button>
        </div>

        <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          <span className="font-black text-foreground">
            {formatRating(place.rating)}
          </span>
          <span>·</span>
          <span>{place.review_count.toLocaleString()} รีวิว</span>
          {place.policy.verified ? (
            <BadgeCheck className="ml-1 size-3.5 text-emerald-500" />
          ) : null}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
          <MapPin className="size-3" />
          <span className="line-clamp-1">{place.address}</span>
          {distance != null ? (
            <span className="ml-auto shrink-0 rounded-md bg-secondary px-1.5 font-black text-secondary-foreground">
              {formatDistance(distance)}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {place.pet_types.includes("dog") ? (
            <Badge variant="dog" className="px-2 text-[10px]">
              🐶 น้องหมา
            </Badge>
          ) : null}
          {place.pet_types.includes("cat") ? (
            <Badge variant="cat" className="px-2 text-[10px]">
              🐱 น้องแมว
            </Badge>
          ) : null}
          {place.pet_types.includes("other") ? (
            <Badge variant="outline" className="px-2 text-[10px]">
              🐰 สัตว์อื่นๆ
            </Badge>
          ) : null}
          <Badge variant="outline" className="px-2 text-[10px]">
            {SIZE_LABELS[place.policy.size_limit].emoji}{" "}
            {SIZE_LABELS[place.policy.size_limit].label}
          </Badge>
          {place.policy.indoor_allowed ? (
            <Badge variant="success" className="px-2 text-[10px]">
              🏠 เข้าในร้านได้
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
