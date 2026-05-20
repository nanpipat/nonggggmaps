"use client";

import { useApp } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Map,
  Heart,
  MessageSquareText,
  Plus,
  BarChart3,
  Download,
  Upload,
  LogOut,
  Sparkles,
  LogIn,
} from "lucide-react";
import {
  authApi,
  dataApi,
  favoritesApi,
  reviewsApi,
  placesApi,
} from "@/lib/api";
import { toast } from "sonner";

export function SideDrawer() {
  const drawerOpen = useApp((s) => s.drawerOpen);
  const setDrawerOpen = useApp((s) => s.setDrawerOpen);
  const user = useApp((s) => s.user);
  const setActiveTab = useApp((s) => s.setActiveTab);
  const setAddOpen = useApp((s) => s.setAddOpen);
  const setLoginModalOpen = useApp((s) => s.setLoginModalOpen);

  const isGuest = user?.provider === "guest";

  const handleSignOut = async () => {
    if (!confirm("ออกจากระบบ?")) return;
    await authApi.signOut();
    useApp.getState().hydrate();
    setDrawerOpen(false);
  };

  const handleExport = () => {
    const data = dataApi.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pawmap-${Date.now()}.json`;
    a.click();
    setDrawerOpen(false);
    toast.success("ส่งออกข้อมูลแล้ว");
  };

  const handleImport = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json";
    inp.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        dataApi.importAll(JSON.parse(await file.text()));
        toast.success("นำเข้าข้อมูลสำเร็จ");
        setDrawerOpen(false);
        location.reload();
      } catch {
        toast.error("ไฟล์ไม่ถูกต้อง");
      }
    };
    inp.click();
  };

  const handleStats = () => {
    const places = placesApi.list();
    const myReviews = user ? reviewsApi.byUser(user.id).length : 0;
    const myPlaces = user
      ? places.filter((p) => p.added_by === user.id).length
      : 0;
    const favs = favoritesApi.list().length;
    const avg =
      places.length > 0
        ? (places.reduce((a, b) => a + b.rating, 0) / places.length).toFixed(2)
        : "0.00";

    toast.message(`📊 สถิติของคุณ`, {
      description: `สถานที่ทั้งหมด: ${places.length}\nที่ชอบ: ${favs}\nรีวิวที่เขียน: ${myReviews}\nสถานที่ที่เพิ่ม: ${myPlaces}\nคะแนนเฉลี่ย: ⭐ ${avg}`,
      duration: 6000,
    });
    setDrawerOpen(false);
  };

  const goTab = (
    tab: typeof user extends never
      ? never
      : "explore" | "favorites" | "myreviews",
  ) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="left" className="w-[88%] max-w-sm p-0">
        <SheetHeader className="border-b-2 border-foreground bg-primary px-6 pb-8 pt-safe">
          <div className="flex items-center gap-3 pt-6">
            <Avatar className="size-14 rounded-lg border-2 border-foreground bg-secondary shadow-soft">
              <AvatarFallback className="bg-secondary text-lg text-foreground">
                {user?.avatar ?? "G"}
              </AvatarFallback>
            </Avatar>
            <div className="text-foreground">
              <SheetTitle className="text-foreground">
                {user?.name ?? "Guest"}
              </SheetTitle>
              <p className="text-[12px] font-semibold opacity-80">
                {user?.email || "ยังไม่ได้ล็อกอิน"}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <DrawerItem
            icon={Map}
            label="สำรวจแผนที่"
            onClick={() => goTab("explore")}
          />
          {isGuest ? (
            <div className="mx-3 my-2 rounded-lg border-2 border-foreground bg-secondary p-4 shadow-soft">
              <p className="mb-2 text-[13px] font-black text-foreground">
                เข้าสู่ระบบเพื่อใช้งานครบทุกฟีเจอร์
              </p>
              <Button
                size="sm"
                className="w-full font-bold shadow-pop"
                onClick={() => {
                  setLoginModalOpen(true);
                  setDrawerOpen(false);
                }}
              >
                <LogIn className="size-4 mr-2" /> เข้าสู่ระบบ
              </Button>
            </div>
          ) : (
            <>
              <DrawerItem
                icon={Heart}
                label="ที่ชอบของฉัน"
                onClick={() => goTab("favorites")}
              />
              <DrawerItem
                icon={MessageSquareText}
                label="รีวิวของฉัน"
                onClick={() => goTab("myreviews")}
              />
            </>
          )}
          <DrawerItem
            icon={Plus}
            label="เพิ่มสถานที่ใหม่"
            onClick={() => {
              if (isGuest) {
                setLoginModalOpen(true);
              } else {
                setAddOpen(true);
              }
              setDrawerOpen(false);
            }}
          />

          <Separator className="my-3" />

          <DrawerItem icon={BarChart3} label="สถิติ" onClick={handleStats} />
          <DrawerItem
            icon={Download}
            label="ส่งออกข้อมูล"
            onClick={handleExport}
          />
          <DrawerItem
            icon={Upload}
            label="นำเข้าข้อมูล"
            onClick={handleImport}
          />

          <Separator className="my-3" />

          <div className="rounded-lg border-2 border-foreground bg-muted p-3.5 shadow-soft">
            <div className="flex items-center gap-2 text-[13px] font-black">
              <Sparkles className="size-4 text-foreground" /> เกี่ยวกับ
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              PawMap MVP v1.0 · กรุงเทพฯ 🇹🇭
              <br />
              ขับเคลื่อนด้วย Next.js · OpenStreetMap · ❤️ จาก community
            </p>
          </div>

          {isGuest ? null : (
            <Button
              variant="ghost"
              className="mt-auto justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" /> ออกจากระบบ
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DrawerItem({
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border-2 border-transparent px-3 py-3 text-[14px] font-bold text-foreground transition hover:border-foreground hover:bg-secondary hover:shadow-soft active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <Icon className="size-[18px] text-foreground" />
      <span className="flex-1 text-left">{label}</span>
      {badge ? (
        <span className="rounded-md border-2 border-foreground bg-primary-soft px-2 py-0.5 text-[11px] font-black text-foreground">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
