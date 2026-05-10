"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { reviewsApi } from "@/lib/api";
import { filesToDataUrls } from "@/lib/photo-upload";
import { RatingStars } from "@/components/places/RatingStars";

export function ReviewModal() {
  const open = useApp((s) => s.reviewOpen);
  const setOpen = useApp((s) => s.setReviewOpen);
  const placeId = useApp((s) => s.selectedPlaceId);
  const places = useApp((s) => s.places);
  const refreshPlaces = useApp((s) => s.refreshPlaces);
  const user = useApp((s) => s.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const place = places.find((p) => p.id === placeId);

  useEffect(() => {
    if (!open) {
      setRating(5);
      setComment("");
      setPhotos([]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.provider === "guest") {
      toast.error("ต้องล็อกอินก่อนเขียนรีวิว");
      return;
    }
    if (!place) return;
    if (!comment.trim()) {
      toast.error("กรุณาเขียนรีวิว");
      return;
    }
    setSubmitting(true);
    try {
      reviewsApi.create({
        place_id: place.id,
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar ?? user.name[0]?.toUpperCase() ?? "U",
        rating,
        comment: comment.trim(),
        photos,
      });
      refreshPlaces();
      toast.success("โพสต์รีวิวแล้ว ขอบคุณ! 💖");
      setOpen(false);
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : ""));
    } finally {
      setSubmitting(false);
    }
  };

  if (!place) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[480px] !p-0">
        <DialogHeader className="border-b border-border px-5 pb-4 pt-5">
          <DialogTitle>เขียนรีวิว</DialogTitle>
          <p className="text-sm text-muted-foreground">เล่าให้ฟังหน่อยนะ พาน้องไปแล้วเป็นยังไง? 🐾</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="rounded-2xl border border-primary-soft bg-primary-soft/50 p-3.5">
            <p className="text-[12px] font-medium text-muted-foreground">รีวิวสถานที่</p>
            <p className="text-[15px] font-bold text-primary">{place.name}</p>
          </div>

          <div className="space-y-2">
            <Label>ให้คะแนน</Label>
            <div className="flex items-center justify-center py-2">
              <RatingStars value={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comment">ความคิดเห็น *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="น้องชอบไหม? ที่นั่งสะดวกไหม พนักงานเป็นมิตรกับน้องหรือเปล่า บรรยากาศเป็นยังไง…"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-photos">รูปภาพ (เลือกได้สูงสุด 5 รูป)</Label>
            <Input
              id="r-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const arr = await filesToDataUrls(e.target.files, { limit: 5 });
                setPhotos(arr);
              }}
            />
            {photos.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative">
                    <Image
                      src={src}
                      alt={`photo ${i}`}
                      width={64}
                      height={64}
                      unoptimized
                      className="size-16 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-rose-500 text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">
              ยกเลิก
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : "โพสต์รีวิว"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
