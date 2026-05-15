"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/store";
import { PawPrint } from "@/components/icons/PawIcons";
import { toast } from "sonner";

export function LoginScreen() {
  const setUser = useApp((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleGoogle = () => {
    const u = authApi.signInWithGoogle();
    setUser(u);
    toast.success(`ยินดีต้อนรับ ${u.name} 👋`);
  };
  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    const u = authApi.signInWithEmail(email, name);
    setUser(u);
    toast.success(`ยินดีต้อนรับ ${u.name} 👋`);
  };
  const handleGuest = () => {
    const u = authApi.signInAsGuest();
    setUser(u);
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-safe">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-primary shadow-lg shadow-primary/30">
            <PawPrint size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-balance font-display text-3xl font-bold tracking-tight">
            PawMap
          </h1>
          <p className="mt-1.5 text-pretty text-sm text-muted-foreground">
            แผนที่สำหรับเจ้าของน้องหมา-แมว<br />
            ค้นหาที่พาน้องเข้าได้จริงในกรุงเทพฯ
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card p-6 shadow-soft-lg">
          <h2 className="text-lg font-bold">เข้าสู่ระบบ</h2>
          <p className="mb-4 text-[13px] text-muted-foreground">
            เพื่อรีวิว เพิ่มสถานที่ และบันทึกที่โปรด
          </p>

          <Button variant="outline" size="lg" className="w-full rounded-full bg-white/5" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.4 4.5 9.8 8.7 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5c-1.9 1.4-4.4 2.1-7 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.7 39.2 16.2 43.5 24 43.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6 5C40.7 35.5 43.5 30.2 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            ดำเนินการต่อด้วย Google
          </Button>

          <div className="my-4 flex items-center gap-3 text-[12px] text-muted-foreground/50">
            <Separator className="flex-1" />
            <span>หรือ</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-2.5" onSubmit={handleEmail}>
            <div className="space-y-1.5">
              <Label htmlFor="login-email">อีเมล</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-name">ชื่อที่จะแสดง</Label>
              <Input
                id="login-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Pim"
                required
              />
            </div>
            <Button type="submit" size="lg" className="mt-2 w-full rounded-full">
              เข้าสู่ระบบด้วยอีเมล
            </Button>
          </form>

          <div className="mt-3 flex flex-col items-center gap-2">
            <button
              onClick={handleGuest}
              className="w-full rounded-full bg-secondary px-3 py-2.5 text-center text-[14px] font-medium text-foreground transition-all hover:bg-white/10 active:scale-[0.98]"
            >
              เข้าดูแผนที่ก่อนได้ →
            </button>
            <p className="text-[11px] text-muted-foreground">
              ไม่ต้องสมัคร ดูได้เลย แต่จะรีวิวหรือเพิ่มสถานที่ต้องล็อกอิน
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          By continuing, you agree to our Terms · v1.0
        </p>
      </div>
    </div>
  );
}
