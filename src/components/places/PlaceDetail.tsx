"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Navigation,
  Clock,
  MapPin,
  PencilLine,
  Star,
  BadgeCheck,
  Plus,
  Globe,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PolicyBadges } from "./PolicyBadges";
import { cn, formatRating, relativeTimeTH, parseOpenStatus } from "@/lib/utils";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import { editsApi, checkinsApi } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  /** When true: compact hero, no back button, no internal scroll (sidebar handles it) */
  sidebar?: boolean;
}

export function PlaceDetail({ sidebar = false }: Props) {
  const selectedId = useApp((s) => s.selectedPlaceId);
  const places = useApp((s) => s.places);
  const closeDetail = useApp((s) => s.closeDetail);
  const favorites = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const setReviewOpen = useApp((s) => s.setReviewOpen);
  const setLoginModalOpen = useApp((s) => s.setLoginModalOpen);
  const reviewsFor = useApp((s) => s.reviewsFor);
  const user = useApp((s) => s.user);

  const isGuest = user?.provider === "guest";

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  if (!selectedId) return null;
  const place = places.find((p) => p.id === selectedId);
  if (!place) return null;

  const category = CATEGORY_BY_ID[place.category];
  const isFav = favorites.includes(place.id);
  const reviews = reviewsFor(place.id);
  const checkins = checkinsApi.byPlace(place.id);

  const handleCheckIn = () => {
    if (isGuest) {
      setLoginModalOpen(true);
      return;
    }
    checkinsApi.create({
      place_id: place.id,
      user_id: user!.id,
      user_name: user!.name,
      user_avatar: user!.avatar ?? user!.name[0]?.toUpperCase() ?? "U",
    });
    toast.success("เช็คอินแล้ว! พาน้องมาเที่ยว 🐾");
  };

  const handleShare = async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const placeUrl = `${baseUrl}?place=${place.id}`;
    const data = {
      title: `PawMap · ${place.name}`,
      text: `${place.name} · ${place.address}`,
      url: placeUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* user cancelled */
      }
    } else {
      const text = `${place.name}\n${place.address}\n${placeUrl}`;
      navigator.clipboard?.writeText(text);
      toast.success("คัดลอกลิงก์แล้ว");
    }
  };

  const handleSuggestEdit = () => {
    if (!editNote.trim()) return;
    editsApi.create({
      place_id: place.id,
      user_id: user?.id ?? "guest",
      note: editNote.trim(),
    });
    setEditNote("");
    setEditModalOpen(false);
    toast.success("ขอบคุณ! ส่งคำแนะนำแล้ว 🙏");
  };

  const Body = (
    <div
      className={cn(
        "space-y-6",
        sidebar
          ? "px-5 pb-10 pr-7 pt-6 lg:px-6 lg:pr-8"
          : "mx-auto max-w-2xl px-5 pb-28 pr-7 pt-6 sm:px-6 sm:pr-8",
      )}
    >
      {/* Title block */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border-2 border-foreground px-2.5 py-1 text-[11px] font-black shadow-soft",
              category.bg,
              category.color,
            )}
          >
            {category.emoji} {category.label}
          </span>
          {place.policy.verified && (
            <Badge variant="success" className="px-2 text-[11px]">
              <BadgeCheck className="mr-0.5 size-3" /> ยืนยันแล้ว
            </Badge>
          )}
        </div>
        <h1 className="mt-2 text-pretty text-[24px] font-black leading-tight tracking-tight">
          {place.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 font-bold">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {formatRating(place.rating)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {place.review_count.toLocaleString()} รีวิว
          </span>
          {place.pet_types.includes("dog") && (
            <Badge variant="dog" className="px-2 text-[11px]">
              🐶 น้องหมา
            </Badge>
          )}
          {place.pet_types.includes("cat") && (
            <Badge variant="cat" className="px-2 text-[11px]">
              🐱 น้องแมว
            </Badge>
          )}
          {place.pet_types.includes("other") && (
            <Badge variant="outline" className="px-2 text-[11px]">
              🐰 สัตว์อื่นๆ
            </Badge>
          )}
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-1 rounded-lg border-2 border-foreground bg-card p-1.5 shadow-soft">
        <InfoRow icon={MapPin} text={place.address} />
        <InfoRow icon={Clock} text={place.hours ?? "ไม่ระบุเวลาทำการ"} />
        {(() => {
          const status = parseOpenStatus(place.hours);
          if (!status) return null;
          return (
            <div className="flex items-center gap-2 px-3 py-2">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-sm",
                  status.open ? "bg-emerald-500" : "bg-rose-500",
                )}
              />
              <span
                className={cn(
                  "text-[13px] font-semibold",
                  status.open ? "text-emerald-700" : "text-rose-700",
                )}
              >
                {status.text}
              </span>
            </div>
          );
        })()}
        {place.phone && (
          <InfoRow
            icon={Phone}
            text={place.phone}
            href={`tel:${place.phone}`}
          />
        )}
        {place.website && (
          <InfoRow icon={Globe} text={place.website} href={place.website} />
        )}
      </div>

      {/* CTAs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button size="lg" className="rounded-lg" asChild>
          <a
            href={googleMapsDirectionsUrl(place, place.name)}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation className="size-4" /> นำทาง
          </a>
        </Button>
        <Button
          variant="soft"
          size="lg"
          className="rounded-lg"
          disabled={!place.phone}
          asChild={!!place.phone}
        >
          {place.phone ? (
            <a href={`tel:${place.phone}`}>
              <Phone className="size-4" /> โทร
            </a>
          ) : (
            <span>
              <Phone className="size-4" /> โทร
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-lg"
          onClick={handleShare}
        >
          <Share2 className="size-4" /> แชร์
        </Button>
      </div>

      {/* Pet policy */}
      <Section title="นโยบายรับน้อง" emoji="🐾">
        <PolicyBadges policy={place.policy} />
      </Section>

      {/* Check-in */}
      <Section title="เช็คอิน" emoji="📍">
        <Button
          variant="soft"
          size="lg"
          className="w-full justify-start rounded-lg"
          onClick={handleCheckIn}
        >
          📍 พาน้องมาแล้ว!
        </Button>
        {checkins.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {checkins.length}
            </span>{" "}
            เช็คอิน
            <span>·</span>
            <span>ล่าสุด {relativeTimeTH(checkins[0].created_at)}</span>
          </div>
        )}
      </Section>

      {/* Notes */}
      {place.notes && (
        <Section title="เกร็ดจากชุมชน" emoji="💬">
          <p className="text-pretty rounded-lg border-2 border-foreground bg-muted p-4 text-[14px] font-semibold leading-relaxed shadow-soft">
            {place.notes}
          </p>
        </Section>
      )}

      {/* Photos */}
      {place.photos.length > 0 && (
        <Section title="รูปภาพ" emoji="📷">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {place.photos.slice(0, 9).map((src, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-square overflow-hidden rounded-md border-2 border-foreground bg-muted shadow-soft transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <Image
                  src={src}
                  alt={`${place.name} - ${i + 1}`}
                  fill
                  sizes="(max-width:640px) 33vw, 200px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </Section>
      )}

      {lightboxIndex >= 0 && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setLightboxIndex(-1)}
        >
          <div className="flex items-center justify-between px-4 pt-safe">
            <span className="text-[13px] font-semibold text-white/70">
              {lightboxIndex + 1} / {place.photos.length}
            </span>
            <button
              onClick={() => setLightboxIndex(-1)}
              className="grid size-10 place-items-center rounded-md border-2 border-white bg-black text-white shadow-soft hover:bg-secondary hover:text-foreground"
            >
              <X className="size-6" />
            </button>
          </div>
          <div
            className="flex flex-1 items-center justify-center px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={place.photos[lightboxIndex]}
              alt={`${place.name} - ${lightboxIndex + 1}`}
              width={1200}
              height={900}
              className="max-h-[80dvh] w-auto rounded-lg object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-6 pb-safe pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(Math.max(0, lightboxIndex - 1));
              }}
              className="grid size-12 place-items-center rounded-md border-2 border-white bg-black text-white shadow-soft transition hover:bg-secondary hover:text-foreground"
              disabled={lightboxIndex === 0}
            >
              ←
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(
                  Math.min(place.photos.length - 1, lightboxIndex + 1),
                );
              }}
              className="grid size-12 place-items-center rounded-md border-2 border-white bg-black text-white shadow-soft transition hover:bg-secondary hover:text-foreground"
              disabled={lightboxIndex === place.photos.length - 1}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <Section title={`รีวิว (${reviews.length})`} emoji="⭐">
        <Button
          variant="soft"
          size="lg"
          className="w-full justify-start rounded-lg"
          onClick={() => {
            if (isGuest) {
              setLoginModalOpen(true);
            } else {
              setReviewOpen(true);
            }
          }}
        >
          <Plus className="size-4" /> รีวิวให้น้องหน่อย 🐾
        </Button>
        <div className="mt-3 space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-foreground bg-muted px-4 py-6 text-center text-sm font-bold text-foreground shadow-soft">
              ยังไม่มีรีวิว ✍️ พาน้องไปแล้วมาเล่าให้ฟังเป็นคนแรกได้เลย!
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border-2 border-foreground bg-card p-4 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {r.user_avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-[14px] font-bold">{r.user_name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {relativeTimeTH(r.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-pretty text-[14px] leading-relaxed">
                  {r.comment}
                </p>
                {r.photos.length > 0 && (
                  <div className="mt-2 flex gap-1.5 overflow-x-auto">
                    {r.photos.map((src, i) => (
                      <div
                        key={i}
                        className="relative size-20 shrink-0 overflow-hidden rounded-md border-2 border-foreground"
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Section>

      <Separator />

      <Button
        variant="ghost"
        className="w-full justify-center text-muted-foreground"
        onClick={() => setEditModalOpen(true)}
      >
        <PencilLine className="size-4" /> แจ้งแก้ไขข้อมูล ✏️
      </Button>

      {editModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg border-2 border-foreground bg-background p-5 shadow-soft-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">แจ้งแก้ไขข้อมูล ✏️</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              เห็นข้อมูลผิดหรือไม่อัปเดต? แนะนำให้เราแก้ไขได้เลย
            </p>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              rows={4}
              placeholder="เช่น ร้านปิดไปแล้ว, เวลาเปิดไม่ถูกต้อง, ไม่รับสัตว์แล้ว…"
              className="mt-3 w-full rounded-lg border-2 border-foreground bg-card p-3 text-[14px] font-semibold shadow-soft outline-none placeholder:text-muted-foreground focus:bg-muted"
            />
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditNote("");
                }}
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1"
                onClick={handleSuggestEdit}
                disabled={!editNote.trim()}
              >
                ส่งคำแนะนำ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (sidebar) {
    return (
      <div>
        {/* Compact hero for sidebar */}
        <div className="relative h-48 w-full bg-muted">
          {place.cover_photo ? (
            <Image
              src={place.cover_photo}
              alt={place.name}
              fill
              sizes="380px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">
              {category.emoji}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Share + heart — top right */}
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="grid size-9 place-items-center rounded-md border-2 border-foreground bg-card text-foreground shadow-soft transition-all hover:bg-secondary active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Share2 className="size-4" />
            </button>
            <button
              onClick={() => {
                if (isGuest) {
                  setLoginModalOpen(true);
                } else {
                  toggleFavorite(place.id);
                }
              }}
              className="grid size-9 place-items-center rounded-md border-2 border-foreground bg-card text-foreground shadow-soft transition-all hover:bg-accent active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Heart
                className={cn(
                  "size-4 transition",
                  isFav && "fill-rose-500 text-rose-500",
                )}
              />
            </button>
          </div>
          {place.photos.length > 1 && (
            <div className="absolute bottom-2.5 right-3 rounded-md border-2 border-white bg-black px-2 py-0.5 text-[11px] font-black text-white shadow-soft">
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
          <Image
            src={place.cover_photo}
            alt={place.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl">
            {category.emoji}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 pt-safe">
          <button
            onClick={closeDetail}
            className="grid size-10 place-items-center rounded-md border-2 border-foreground bg-card text-foreground shadow-soft-md transition-all hover:bg-secondary active:translate-x-1 active:translate-y-1 active:shadow-none"
            aria-label="กลับ"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="grid size-10 place-items-center rounded-md border-2 border-foreground bg-card text-foreground shadow-soft-md transition-all hover:bg-secondary active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Share2 className="size-4" />
            </button>
            <button
              onClick={() => {
                if (isGuest) {
                  setLoginModalOpen(true);
                } else {
                  toggleFavorite(place.id);
                }
              }}
              className="grid size-10 place-items-center rounded-md border-2 border-foreground bg-card text-foreground shadow-soft-md transition-all hover:bg-accent active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Heart
                className={cn(
                  "size-5 transition",
                  isFav && "fill-rose-500 text-rose-500",
                )}
              />
            </button>
          </div>
        </div>
        {place.photos.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-md border-2 border-white bg-black px-2.5 py-1 text-[11px] font-black text-white shadow-soft">
            📷 {place.photos.length} รูป
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">{Body}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-secondary">
      <div className="grid size-8 place-items-center rounded-md border-2 border-foreground bg-muted text-foreground shadow-soft">
        <Icon className="size-4" />
      </div>
      <span className={cn("text-[14px] font-semibold", href && "font-black text-foreground underline decoration-2 underline-offset-2")}>
        {text}
      </span>
    </div>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      {inner}
    </a>
  ) : (
    inner
  );
}

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-black uppercase tracking-wider text-foreground">
        {emoji && <span>{emoji}</span>}
        {title}
      </h3>
      {children}
    </section>
  );
}
