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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function LoginModal() {
  const open = useApp((s) => s.loginModalOpen);
  const setOpen = useApp((s) => s.setLoginModalOpen);
  const setUser = useApp((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleGoogle = () => {
    const u = authApi.signInWithGoogle();
    setUser(u);
    setOpen(false);
    toast.success(`ยินดีต้อนรับ ${u.name} 👋`);
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    const u = authApi.signInWithEmail(email, name);
    setUser(u);
    setOpen(false);
    toast.success(`ยินดีต้อนรับ ${u.name} 👋`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[400px] !p-0 overflow-hidden rounded-3xl border-none shadow-soft-xl">
        <DialogHeader className="bg-gradient-to-br from-primary via-primary to-accent px-6 pb-8 pt-8 text-white">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm">
            <PawPrint size={32} className="text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-extrabold text-white">เข้าสู่ระบบ PawMap</DialogTitle>
          <p className="text-center text-sm text-white/80">
            เพื่อร่วมแชร์รีวิว และบันทึกสถานที่โปรดของคุณ 🐾
          </p>
        </DialogHeader>

        <div className="bg-white p-6">
          <Button variant="outline" size="lg" className="w-full h-12 rounded-xl border-border/60 font-semibold" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 48 48" className="mr-2">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.4 4.5 9.8 8.7 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5c-1.9 1.4-4.4 2.1-7 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.7 39.2 16.2 43.5 24 43.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6 5C40.7 35.5 43.5 30.2 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            ดำเนินการต่อด้วย Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <Separator className="flex-1" />
            <span>หรือ</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4" onSubmit={handleEmail}>
            <div className="space-y-1.5">
              <Label htmlFor="modal-email" className="text-[13px] font-bold text-muted-foreground">อีเมล</Label>
              <Input
                id="modal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11 rounded-xl bg-muted/30 border-none focus:bg-white focus:ring-1 focus:ring-primary/40 transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modal-name" className="text-[13px] font-bold text-muted-foreground">ชื่อที่จะแสดง</Label>
              <Input
                id="modal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Pim"
                className="h-11 rounded-xl bg-muted/30 border-none focus:bg-white focus:ring-1 focus:ring-primary/40 transition-all"
                required
              />
            </div>
            <Button type="submit" size="lg" className="mt-2 w-full h-11 rounded-xl font-bold shadow-pop transition-transform active:scale-95">
              เข้าสู่ระบบด้วยอีเมล
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
