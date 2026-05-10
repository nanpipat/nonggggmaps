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
        icon={Snowflake}
        label="แอร์"
        ok={policy.ac}
        okText="มี"
        noText="ไม่มี"
      />
      <PolicyItem
        icon={PawPrint}
        label="โซนสัตว์เลี้ยง"
        ok={policy.pet_zone}
        okText="มี"
        noText="ไม่มี"
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
        icon={ShieldCheck}
        label="ตรวจสอบแล้ว"
        ok={policy.verified}
        okText="ยืนยัน"
        noText="ยังไม่ยืนยัน"
      />
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
        "flex items-center gap-3 rounded-2xl border px-3 py-3",
        neutral
          ? "border-border bg-muted/40"
          : ok
          ? "border-emerald-200/70 bg-emerald-50"
          : "border-rose-200/70 bg-rose-50",
      )}
    >
      <div
        className={cn(
          "grid size-8 place-items-center rounded-xl",
          neutral ? "bg-white text-foreground" : ok ? "bg-emerald-200/60 text-emerald-700" : "bg-rose-200/60 text-rose-700",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div
          className={cn(
            "text-[13px] font-bold",
            neutral ? "text-foreground" : ok ? "text-emerald-800" : "text-rose-800",
          )}
        >
          {ok ? okText : noText}
        </div>
      </div>
    </div>
  );
}
