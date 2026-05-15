"use client";

import {
  Home,
  ShoppingBag,
  Snowflake,
  PawPrint,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import type { PetPolicy } from "@/lib/types";
import { SIZE_LABELS } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Props {
  policy: PetPolicy;
}

export function PolicyBadges({ policy }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">เงื่อนไขหลัก</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <PolicyItem
            icon={Home}
            label="เข้าในร้าน"
            ok={policy.indoor_allowed}
            okText="เข้าได้"
            noText="ไม่ได้"
          />
          <PolicyItem
            icon={ShoppingBag}
            label="กระเป๋า/รถเข็น"
            ok={!policy.carrier_required}
            okText="ไม่ต้องใส่"
            noText="ต้องใส่"
          />
          <PolicyItem
            icon={Ruler}
            label="ขนาดที่รับ"
            ok={true}
            okText={SIZE_LABELS[policy.size_limit].label}
            noText=""
            neutral
          />
          <PolicyItem
            icon={PawPrint}
            label="โซนสัตว์เลี้ยง"
            ok={policy.pet_zone}
            okText="มี"
            noText="ไม่มี"
          />
        </div>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">ข้อมูลเพิ่มเติม</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <PolicyItem
            icon={Snowflake}
            label="แอร์"
            ok={policy.ac}
            okText="มี"
            noText="ไม่มี"
          />
          <PolicyItem
            icon={ShieldCheck}
            label="ตรวจสอบแล้ว"
            ok={policy.verified}
            okText="ยืนยัน"
            noText="ยังไม่ยืนยัน"
          />
        </div>
      </div>
    </div>
  );
}

function PolicyItem({
  icon: Icon,
  label,
  ok,
  okText,
  noText,
  neutral,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  ok: boolean;
  okText: string;
  noText: string;
  neutral?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border-2 border-foreground px-3 py-3 shadow-soft",
        neutral
          ? "bg-muted"
          : ok
          ? "bg-emerald-200"
          : "bg-rose-200",
      )}
    >
      <div
        className={cn(
          "grid size-8 place-items-center rounded-md border-2 border-foreground shadow-soft",
          neutral ? "bg-card text-foreground" : ok ? "bg-primary text-foreground" : "bg-accent text-foreground",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-black uppercase tracking-wide text-foreground/70">
          {label}
        </div>
        <div
          className={cn(
            "text-[13px] font-black text-foreground",
          )}
        >
          {ok ? okText : noText}
        </div>
      </div>
    </div>
  );
}
