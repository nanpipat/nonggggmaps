"use client";

import Image from "next/image";
import {
  ArrowLeft, Heart, Share2, Phone, Navigation, Clock, MapPin,
  PencilLine, Star, BadgeCheck, Plus, Globe,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PolicyBadges } from "./PolicyBadges";
import { cn, formatRating, relativeTimeTH } from "@/lib/utils";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import { editsApi } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  /** When true: compact hero, no back button, no internal scroll (sidebar handles it) */
  sidebar?: boolean;
}

export function PlaceDetail({ sidebar = false }: Props) {
  const selectedId     = useApp((s) => s.selectedPlaceId);
  const places         = useApp((s) => s.places);
  const closeDetail    = useApp((s) => s.closeDetail);
  const favorites      = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const setReviewOpen  = useApp((s) => s.setReviewOpen);
  const reviewsFor     = useApp((s) => s.reviewsFor);
  const user           = useApp((s) => s.user);

  if (!selectedId) return null;
  const place = places.find((p) => p.id === selectedId);
  if (!place) return null;

  const category = CATEGORY_BY_ID[place.category];
  const isFav    = favorites.includes(place.id);
  const reviews  = reviewsFor(place.id);

  const handleShare = async () => {
    const data = {
      title: `PawMap · ${place.name}`,
      text: `${place.name} · ${place.address}`,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* user cancelled */ }
    } else {
      const text = `${place.name}\n${place.address}\nhttps://maps.google.com/?q=${place.lat},${place.lng}`;
      navigator.clipboard?.writeText(text);
      toast.success("คัดลอกที่อยู่แล้ว");
    }
  };

  const handleSuggestEdit = () => {
    const note = prompt("คุณอยากแนะนำให้แก้ไขเรื่องไหน?");
    if (!note?.trim()) return;
    editsApi.create({ place_id: place.id, user_id: user?.id ?? "guest", note: note.trim() });
    toast.success("ขอบคุณ! ส่งคำแนะนำแล้ว 🙏");
  };

  const Body = (
    <div className={cn("space-y-6", sidebar ? "px-4 pb-8 pt-5" : "mx-auto max-w-2xl px-4 pb-24 pt-5")}>
      {/* Title block */}
      <div>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", category.bg, category.color)}>
            {category.emoji} {category.label}
          </span>
          {place.policy.verified && (
            <Badge variant="success" className="px-2 text-[11px]">
              <BadgeCheck className="mr-0.5 size-3" /> ยืนยันแล้ว
            </Badge>
          )}
        </div>
        <h1 className="mt-2 text-pretty text-[24px] font-extrabold leading-tight tracking-tight">
          {place.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 font-bold">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {formatRating(place.rating)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{place.review_count.toLocaleString()} รีวิว</span>
          {place.pet_types.includes("dog") && <Badge variant="dog" className="px-2 text-[11px]">🐶 น้องหมา</Badge>}
          {place.pet_types.includes("cat") && <Badge variant="cat" className="px-2 text-[11px]">🐱 น้องแมว</Badge>}
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-1 rounded-2xl border border-border/60 bg-card p-1.5">
        <InfoRow icon={MapPin} text={place.address} />
        <InfoRow icon={Clock} text={place.hours ?? "ไม่ระบุเวลาทำการ"} />
        {place.phone && <InfoRow icon={Phone} text={place.phone} href={`tel:${place.phone}`} />}
        {place.website && <InfoRow icon={Globe} text={place.website} href={place.website} />}
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-3 gap-2">
        <Button size="lg" className="rounded-2xl" asChild>
          <a href={googleMapsDirectionsUrl(place, place.name)} target="_blank" rel="noreferrer">
            <Navigation className="size-4" /> นำทาง
          </a>
        </Button>
        <Button variant="soft" size="lg" className="rounded-2xl" disabled={!place.phone} asChild={!!place.phone}>
          {place.phone ? (
            <a href={`tel:${place.phone}`}><Phone className="size-4" /> โทร</a>
          ) : (
            <span><Phone className="size-4" /> โทร</span>
          )}
        </Button>
        <Button variant="outline" size="lg" className="rounded-2xl" onClick={handleShare}>
          <Share2 className="size-4" /> แชร์
        </Button>
      </div>

      {/* Pet policy */}
      <Section title="นโยบายรับน้อง" emoji="🐾">
        <PolicyBadges policy={place.policy} />
      </Section>

      {/* Notes */}
      {place.notes && (
        <Section title="เกร็ดจากชุมชน" emoji="💬">
          <p className="text-pretty rounded-2xl bg-muted/50 p-4 text-[14px] leading-relaxed">{place.notes}</p>
        </Section>
      )}

      {/* Photos */}
      {place.photos.length > 0 && (
        <Section title="รูปภาพ" emoji="📷">
          <div className="grid grid-cols-3 gap-1.5">
            {place.photos.slice(0, 9).map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={src} alt={`${place.name} - ${i + 1}`} fill sizes="(max-width:640px) 33vw, 200px" className="object-cover" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Reviews */}
      <Section title={`รีวิว (${reviews.length})`} emoji="⭐">
        <Button variant="soft" size="lg" className="w-full justify-start rounded-2xl" onClick={() => setReviewOpen(true)}>
          <Plus className="size-4" /> รีวิวให้น้องหน่อย 🐾
        </Button>
        <div className="mt-3 space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
              ยังไม่มีรีวิว ✍️ พาน้องไปแล้วมาเล่าให้ฟังเป็นคนแรกได้เลย!
            </div>
          ) : reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs">{r.user_avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-[14px] font-bold">{r.user_name}</div>
                  <div className="text-[11px] text-muted-foreground">{relativeTimeTH(r.created_at)}</div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-pretty text-[14px] leading-relaxed">{r.comment}</p>
              {r.photos.length > 0 && (
                <div className="mt-2 flex gap-1.5 overflow-x-auto">
                  {r.photos.map((src, i) => (
                    <div key={i} className="relative size-20 shrink-0 overflow-hidden rounded-lg">
                      <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Separator />

      <Button variant="ghost" className="w-full justify-center text-muted-foreground" onClick={handleSuggestEdit}>
        <PencilLine className="size-4" /> แจ้งแก้ไขข้อมูล ✏️
      </Button>
    </div>
  );

  if (sidebar) {
    return (
      <div>
        {/* Compact hero for sidebar */}
        <div className="relative h-48 w-full bg-muted">
          {place.cover_photo ? (
            <Image src={place.cover_photo} alt={place.name} fill sizes="380px" className="object-cover" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">{category.emoji}</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Share + heart — top right */}
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button onClick={handleShare} className="grid size-9 place-items-center rounded-full bg-white/90 text-foreground shadow-soft backdrop-blur">
              <Share2 className="size-4" />
            </button>
            <button
              onClick={() => toggleFavorite(place.id)}
              className="grid size-9 place-items-center rounded-full bg-white/90 text-foreground shadow-soft backdrop-blur"
            >
              <Heart className={cn("size-4 transition", isFav && "fill-rose-500 text-rose-500")} />
            </button>
          </div>
          {place.photos.length > 1 && (
            <div className="absolute bottom-2.5 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
              📷 {place.photos.length} รูป
            </div>
          )}
        </div>
        {Body}
      </div>
    );
  }

  // Mobile full-height layout
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Full hero */}
      <div className="relative h-[42dvh] min-h-[240px] w-full shrink-0 bg-muted">
        {place.cover_photo ? (
          <Image src={place.cover_photo} alt={place.name} fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl">{category.emoji}</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 pt-safe">
          <button
            onClick={closeDetail}
            className="grid size-10 place-items-center rounded-full bg-white/95 text-foreground shadow-soft-md backdrop-blur"
            aria-label="กลับ"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="grid size-10 place-items-center rounded-full bg-white/95 text-foreground shadow-soft-md backdrop-blur">
              <Share2 className="size-4" />
            </button>
            <button onClick={() => toggleFavorite(place.id)} className="grid size-10 place-items-center rounded-full bg-white/95 text-foreground shadow-soft-md backdrop-blur">
              <Heart className={cn("size-5 transition", isFav && "fill-rose-500 text-rose-500")} />
            </button>
          </div>
        </div>
        {place.photos.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            📷 {place.photos.length} รูป
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">{Body}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, text, href }: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-muted/60">
      <div className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <span className={cn("text-[14px]", href && "font-semibold text-primary")}>{text}</span>
    </div>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{inner}</a>
  ) : inner;
}

function Section({ title, emoji, children }: { title: string; emoji?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
        {emoji && <span>{emoji}</span>}
        {title}
      </h3>
      {children}
    </section>
  );
}
