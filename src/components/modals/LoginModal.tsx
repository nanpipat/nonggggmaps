"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/store";
import { PawPrint } from "@/components/icons/PawIcons";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "signin" | "signup";

export function LoginModal() {
  const open = useApp((s) => s.loginModalOpen);
  const setOpen = useApp((s) => s.setLoginModalOpen);
  const setUser = useApp((s) => s.setUser);

  const [tab, setTab] = useState<Tab>("signin");

  // Sign-in
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siLoading, setSiLoading] = useState(false);
  const [siError, setSiError] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);

  // Sign-up
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suLoading, setSuLoading] = useState(false);
  const [suError, setSuError] = useState("");
  const [suShowPw, setSuShowPw] = useState(false);
  const [suEmailSent, setSuEmailSent] = useState(false);

  const resetAll = () => {
    setSiEmail(""); setSiPassword(""); setSiError("");
    setSuName(""); setSuEmail(""); setSuPassword(""); setSuConfirm("");
    setSuError(""); setSuEmailSent(false);
  };

  const handleGoogle = async () => {
    const { user, error } = await authApi.signInWithGoogle();
    if (error) { toast.error(error); return; }
    if (user) {
      setUser(user);
      setOpen(false);
      resetAll();
      toast.success(`ยินดีต้อนรับ ${user.name} 👋`);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiError("");
    if (!siEmail || !siPassword) { setSiError("กรุณากรอกอีเมลและรหัสผ่าน"); return; }
    setSiLoading(true);
    const { user, error } = await authApi.signInWithEmailPassword(siEmail, siPassword);
    setSiLoading(false);
    if (error) { setSiError(error); return; }
    if (user) {
      setUser(user);
      setOpen(false);
      resetAll();
      toast.success(`ยินดีต้อนรับกลับมา ${user.name} 👋`);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuError("");
    if (!suName.trim()) { setSuError("กรุณาใส่ชื่อของคุณ"); return; }
    if (!suEmail) { setSuError("กรุณาใส่อีเมล"); return; }
    if (suPassword.length < 6) { setSuError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (suPassword !== suConfirm) { setSuError("รหัสผ่านไม่ตรงกัน"); return; }
    setSuLoading(true);
    const { user, error } = await authApi.signUpWithEmail(suEmail, suPassword, suName.trim());
    setSuLoading(false);
    if (error) { setSuError(error); return; }
    if (user) {
      setUser(user);
      setOpen(false);
      resetAll();
      toast.success(`ยินดีต้อนรับ ${user.name}! 🎉`);
    } else if (isSupabaseConfigured) {
      setSuEmailSent(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll(); }}>
      <DialogContent className="!max-w-[400px] !p-0 overflow-hidden rounded-lg border-2 border-foreground shadow-soft-xl">
        <DialogHeader className="border-b-2 border-foreground bg-primary px-6 pb-5 pr-14 pt-6 text-foreground">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-lg border-2 border-foreground bg-secondary shadow-soft">
            <PawPrint size={28} className="text-foreground" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-foreground">
            เข้าสู่ระบบ PawMap
          </DialogTitle>
          <p className="text-center text-[13px] font-semibold text-foreground/80">
            เพื่อร่วมแชร์รีวิว และบันทึกสถานที่โปรดของคุณ 🐾
          </p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b-2 border-foreground">
          <TabBtn active={tab === "signin"} onClick={() => { setTab("signin"); setSiError(""); }}>
            เข้าสู่ระบบ
          </TabBtn>
          <TabBtn active={tab === "signup"} onClick={() => { setTab("signup"); setSuError(""); }}>
            สมัครสมาชิก
          </TabBtn>
        </div>

        <div className="bg-card p-5">
          <Button variant="outline" size="lg" className="w-full h-11 rounded-lg font-black" onClick={handleGoogle}>
            <GoogleIcon />
            ดำเนินการต่อด้วย Google
          </Button>

          <div className="my-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <Separator className="flex-1" />
            <span>หรือ</span>
            <Separator className="flex-1" />
          </div>

          {tab === "signin" && (
            <form className="space-y-3" onSubmit={handleSignIn}>
              <div className="space-y-1.5">
                <Label htmlFor="m-si-email" className="text-[13px] font-black">อีเมล</Label>
                <Input id="m-si-email" type="email" value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  placeholder="your@email.com" autoComplete="email" className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-si-password" className="text-[13px] font-black">รหัสผ่าน</Label>
                <div className="relative">
                  <Input id="m-si-password" type={siShowPw ? "text" : "password"}
                    value={siPassword} onChange={(e) => setSiPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password" className="h-11 pr-10" required />
                  <button type="button" onClick={() => setSiShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                    {siShowPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {siError && <ErrorBox>{siError}</ErrorBox>}
              <Button type="submit" size="lg" className="h-11 w-full rounded-lg font-black shadow-pop" disabled={siLoading}>
                {siLoading ? <Loader2 className="size-4 animate-spin" /> : "เข้าสู่ระบบ"}
              </Button>
            </form>
          )}

          {tab === "signup" && (
            <>
              {suEmailSent ? (
                <div className="rounded-lg border-2 border-foreground bg-secondary p-4 text-center shadow-soft">
                  <div className="text-3xl">📬</div>
                  <h3 className="mt-2 font-black">ตรวจสอบอีเมลของคุณ</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    เราส่งลิงก์ยืนยันไปที่{" "}
                    <span className="font-bold text-foreground">{suEmail}</span>{" "}แล้ว
                  </p>
                  <Button variant="outline" size="sm" className="mt-3"
                    onClick={() => { setSuEmailSent(false); setTab("signin"); setOpen(false); }}>
                    รับทราบ
                  </Button>
                </div>
              ) : (
                <form className="space-y-3" onSubmit={handleSignUp}>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-su-name" className="text-[13px] font-black">ชื่อที่จะแสดง</Label>
                    <Input id="m-su-name" value={suName}
                      onChange={(e) => setSuName(e.target.value)}
                      placeholder="เช่น Pim" autoComplete="name" className="h-11" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-su-email" className="text-[13px] font-black">อีเมล</Label>
                    <Input id="m-su-email" type="email" value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      placeholder="your@email.com" autoComplete="email" className="h-11" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-su-password" className="text-[13px] font-black">รหัสผ่าน</Label>
                    <div className="relative">
                      <Input id="m-su-password" type={suShowPw ? "text" : "password"}
                        value={suPassword} onChange={(e) => setSuPassword(e.target.value)}
                        placeholder="อย่างน้อย 6 ตัวอักษร" autoComplete="new-password"
                        className="h-11 pr-10" required />
                      <button type="button" onClick={() => setSuShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                        {suShowPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-su-confirm" className="text-[13px] font-black">ยืนยันรหัสผ่าน</Label>
                    <Input id="m-su-confirm" type={suShowPw ? "text" : "password"}
                      value={suConfirm} onChange={(e) => setSuConfirm(e.target.value)}
                      placeholder="••••••••" autoComplete="new-password" className="h-11" required />
                  </div>
                  {suError && <ErrorBox>{suError}</ErrorBox>}
                  <Button type="submit" size="lg" className="h-11 w-full rounded-lg font-black shadow-pop" disabled={suLoading}>
                    {suLoading ? <Loader2 className="size-4 animate-spin" /> : "สมัครสมาชิก"}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "flex-1 py-2.5 text-[13px] font-black transition-colors",
        active ? "bg-primary text-foreground" : "bg-card text-muted-foreground hover:bg-muted",
      )}>
      {children}
    </button>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border-2 border-rose-400 bg-rose-50 px-3 py-2 text-[13px] font-semibold text-rose-700">
      {children}
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" className="mr-2 shrink-0">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.4 4.5 9.8 8.7 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5c-1.9 1.4-4.4 2.1-7 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.7 39.2 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6 5C40.7 35.5 43.5 30.2 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
