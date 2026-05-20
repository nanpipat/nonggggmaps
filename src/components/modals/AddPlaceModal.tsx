"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPinned, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { placesApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES, SIZE_LABELS } from "@/lib/categories";
import type { PlaceCategory, PetType, SizeLimit } from "@/lib/types";
import { filesToDataUrls } from "@/lib/photo-upload";
import { flyTo } from "@/lib/map-helpers";

const SIZE_KEYS: SizeLimit[] = ["any", "small", "medium", "large"];

export function AddPlaceModal() {
  const open = useApp((s) => s.addOpen);
  const setOpen = useApp((s) => s.setAddOpen);
  const startPicking = useApp((s) => s.startPickingLocation);
  const pickingResult = useApp((s) => s.pickingResult);
  const refreshPlaces = useApp((s) => s.refreshPlaces);
  const selectPlace = useApp((s) => s.selectPlace);
  const user = useApp((s) => s.user);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("cafe");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [pets, setPets] = useState<Set<PetType>>(new Set(["dog"]));
  const [policy, setPolicy] = useState({
    indoor_allowed: true,
    carrier_required: false,
    ac: true,
    pet_zone: false,
  });
  const [sizeLimit, setSizeLimit] = useState<SizeLimit>("any");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Sync result from map picker
  useEffect(() => {
    if (pickingResult) {
      setLat(pickingResult.lat.toFixed(6));
      setLng(pickingResult.lng.toFixed(6));
    }
  }, [pickingResult]);

  const reset = () => {
    setName("");
    setCategory("cafe");
    setAddress("");
    setLat("");
    setLng("");
    setPets(new Set(["dog"]));
    setPolicy({
      indoor_allowed: true,
      carrier_required: false,
      ac: true,
      pet_zone: false,
    });
    setSizeLimit("any");
    setNotes("");
    setPhotos([]);
  };

  const togglePet = (p: PetType) => {
    const next = new Set(pets);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setPets(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("กรุณาใส่ชื่อสถานที่");
    if (!lat || !lng) return toast.error("กรุณาระบุตำแหน่ง");
    if (pets.size === 0)
      return toast.error("เลือกประเภทสัตว์เลี้ยงอย่างน้อย 1");

    setSubmitting(true);
    try {
      const newPlace = placesApi.create({
        name: name.trim(),
        category,
        address: address.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        phone: null,
        hours: null,
        website: null,
        pet_types: Array.from(pets),
        policy: {
          ...policy,
          size_limit: sizeLimit,
          verified: false,
        },
        notes: notes.trim() || null,
        photos,
        cover_photo: photos[0] ?? null,
        added_by: user?.id ?? null,
      });
      refreshPlaces();
      flyTo(newPlace.lat, newPlace.lng, 16);
      reset();
      setOpen(false);
      setTimeout(() => selectPlace(newPlace.id), 350);
      toast.success("เพิ่มสถานที่ใหม่แล้ว 🎉");
    } catch (err) {
      toast.error(
        "เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "unknown"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[540px] !p-0">
        <DialogHeader className="border-b border-border px-5 pb-4 pt-5">
          <DialogTitle>เพิ่มสถานที่ใหม่</DialogTitle>
          <p className="text-sm text-muted-foreground">
            ช่วยกันเติมแผนที่ ให้น้องๆ ได้ออกไปเที่ยวกัน 🐾
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <Field id="name" label="ชื่อสถานที่ *">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น True Coffee Asok"
              required
            />
          </Field>

          <Field id="category" label="ประเภท *">
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as PlaceCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="address" label="ที่อยู่">
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ถนน / แขวง / เขต"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2.5">
            <Field id="lat" label="Latitude *">
              <Input
                id="lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="13.7563"
                required
              />
            </Field>
            <Field id="lng" label="Longitude *">
              <Input
                id="lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="100.5018"
                required
              />
            </Field>
          </div>

          <Button
            type="button"
            variant="soft"
            className="w-full"
            onClick={() => {
              setOpen(false);
              setTimeout(startPicking, 250);
            }}
          >
            <MapPinned className="size-4" /> เลือกตำแหน่งจากแผนที่
          </Button>

          <div>
            <Label>ประเภทสัตว์เลี้ยง *</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <PetToggle
                active={pets.has("dog")}
                onClick={() => togglePet("dog")}
              >
                🐶 น้องหมา
              </PetToggle>
              <PetToggle
                active={pets.has("cat")}
                onClick={() => togglePet("cat")}
              >
                🐱 น้องแมว
              </PetToggle>
              <PetToggle
                active={pets.has("other")}
                onClick={() => togglePet("other")}
              >
                🐰 สัตว์อื่นๆ
              </PetToggle>
            </div>
          </div>

          <div>
            <Label>นโยบายสัตว์เลี้ยง</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <PolicyChk
                checked={policy.indoor_allowed}
                onChange={(c) => setPolicy({ ...policy, indoor_allowed: c })}
                label="🏠 เข้าในร้าน"
              />
              <PolicyChk
                checked={policy.carrier_required}
                onChange={(c) => setPolicy({ ...policy, carrier_required: c })}
                label="🎒 ต้องใส่กระเป๋า"
              />
              <PolicyChk
                checked={policy.ac}
                onChange={(c) => setPolicy({ ...policy, ac: c })}
                label="❄️ มีแอร์"
              />
              <PolicyChk
                checked={policy.pet_zone}
                onChange={(c) => setPolicy({ ...policy, pet_zone: c })}
                label="🐾 มีโซน pet"
              />
            </div>
          </div>

          <Field id="size" label="ขนาดที่รับได้">
            <Select
              value={sizeLimit}
              onValueChange={(v) => setSizeLimit(v as SizeLimit)}
            >
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_KEYS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SIZE_LABELS[s].emoji} {SIZE_LABELS[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="notes" label="หมายเหตุ / เกร็ดสำหรับเจ้าของน้อง">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ห้ามขึ้นเก้าอี้, รับเฉพาะที่ outdoor…"
            />
          </Field>

          <Field id="photos" label="รูปภาพ (เลือกได้สูงสุด 6 รูป)">
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const arr = await filesToDataUrls(e.target.files);
                setPhotos(arr);
              }}
            />
            {photos.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative">
                    <Image
                      src={src}
                      alt={`upload ${i}`}
                      width={64}
                      height={64}
                      unoptimized
                      className="size-16 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos(photos.filter((_, j) => j !== i))
                      }
                      className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-rose-500 text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </Field>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "บันทึกสถานที่"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function PetToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold transition-colors data-[active=true]:border-primary data-[active=true]:bg-primary-soft data-[active=true]:text-primary"
    >
      {children}
    </button>
  );
}

function PolicyChk({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
