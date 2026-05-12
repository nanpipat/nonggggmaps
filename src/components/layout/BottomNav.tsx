"use client";

import { Map, Heart, MessageSquareText, User, Plus } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "explore", label: "สำรวจ", icon: Map },
  { id: "favorites", label: "ที่ชอบ", icon: Heart },
  { id: "myreviews", label: "รีวิวฉัน", icon: MessageSquareText },
  { id: "profile", label: "โปรไฟล์", icon: User },
] as const;

export function BottomNav() {
  const activeTab = useApp((s) => s.activeTab);
  const setActiveTab = useApp((s) => s.setActiveTab);
  const setAddOpen = useApp((s) => s.setAddOpen);
  const setDrawerOpen = useApp((s) => s.setDrawerOpen);

  return (
    <nav
      className={cn(
        "absolute inset-x-0 bottom-0 z-30 mx-auto flex h-[68px] max-w-3xl items-stretch",
        "border-t border-border/60 bg-card/95 pb-safe shadow-soft-md backdrop-blur-md",
      )}
      aria-label="bottom navigation"
    >
      {TABS.slice(0, 2).map((t) => (
        <NavItem
          key={t.id}
          active={activeTab === t.id}
          onClick={() => {
            if (t.id === "profile") setDrawerOpen(true);
            else setActiveTab(t.id);
          }}
          Icon={t.icon}
          label={t.label}
        />
      ))}

      {/* Center FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="relative -mt-5 flex flex-1 items-center justify-center"
        aria-label="เพิ่มสถานที่"
      >
        <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-pop">
          <Plus className="size-6" strokeWidth={2.5} />
        </span>
      </button>

      {TABS.slice(2).map((t) => (
        <NavItem
          key={t.id}
          active={activeTab === t.id || (t.id === "profile" && false)}
          onClick={() => {
            if (t.id === "profile") setDrawerOpen(true);
            else setActiveTab(t.id);
          }}
          Icon={t.icon}
          label={t.label}
        />
      ))}
    </nav>
  );
}

function NavItem({
  active,
  Icon,
  label,
  onClick,
}: {
  active: boolean;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-[22px]" />
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}
