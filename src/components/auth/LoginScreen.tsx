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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "signin" | "signup";

export function LoginScreen() {
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

  const handleGoogle = async () => {
    const { user, error } = await authApi.signInWithGoogle();
    if (error) { toast.error(error); return; }
    if (user) {
      setUser(user);
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
      toast.success(`ยินดีต้อนรับ ${user.name}! 🎉`);
    } else if (isSupabaseConfigured) {
      setSuEmailSent(true);
    }
  };

  const handleGuest = () => {
    const u = authApi.signInAsGuest();
    setUser(u);
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-safe">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-lg border-2 border-foreground bg-primary shadow-pop">
            <PawPrint size={32} className="text-foreground" />
          </div>
          <h1 className="text-balance font-display text-3xl font-black tracking-tight text-foreground">
            PawMap
          </h1>
          <p className="mt-1.5 text-pretty text-sm text-muted-foreground">
            แผนที่สำหรับเจ้าของน้องหมา-แมว<br />
            ค้นหาที่พาน้องเข้าได้จริงในกรุงเทพฯ
          </p>
        </div>

        <div className="rounded-lg border-2 border-foreground bg-card shadow-soft-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b-2 border-foreground">
            <TabBtn active={tab === "signin"} onClick={() => { setTab("signin"); setSiError(""); }}>
              เข้าสู่ระบบ
            </TabBtn>
            <TabBtn active={tab === "signup"} onClick={() => { setTab("signup"); setSuError(""); }}>
              สมัครสมาชิก
            </TabBtn>
          </div>

          <div className="p-6">
            <Button variant="outline" size="lg" className="w-full" onClick={handleGoogle}>
              <GoogleIcon />
              ดำเนินการต่อด้วย Google
            </Button>

            <div className="my-4 flex items-center gap-3 text-[12px] text-muted-foreground">
              <Separator className="flex-1" />
              <span>หรือ</span>
              <Separator className="flex-1" />
            </div>

            {tab === "signin" && (
              <form className="space-y-3" onSubmit={handleSignIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">อีเมล</Label>
                  <Input id="si-email" type="email" value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    placeholder="your@email.com" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-password">รหัสผ่าน</Label>
                  <div className="relative">
                    <Input id="si-password" type={siShowPw ? "text" : "password"}
                      value={siPassword} onChange={(e) => setSiPassword(e.target.value)}
                      placeholder="••••••••" autoComplete="current-password" className="pr-10" required />
                    <button type="button" onClick={() => setSiShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                      {siShowPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                {siError && <ErrorBox>{siError}</ErrorBox>}
                <Button type="submit" size="lg" className="mt-1 w-full" disabled={siLoading}>
                  {siLoading ? <Loader2 className="size-4 animate-spin" /> : "เข้าสู่ระบบ"}
                </Button>
              </form>
            )}

            {tab === "signup" && (
              <>
                {suEmailSent ? (
                  <div className="rounded-lg border-2 border-foreground bg-secondary p-5 text-center shadow-soft">
                    <div className="text-3xl">📬</div>
                    <h3 className="mt-2 font-black">ตรวจสอบอีเมลของคุณ</h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      เราส่งลิงก์ยืนยันไปที่{" "}
                      <span className="font-bold text-foreground">{suEmail}</span>{" "}แล้ว
                      กรุณาคลิกลิงก์ในอีเมลเพื่อเริ่มใช้งาน
                    </p>
                    <Button variant="outline" size="sm" className="mt-4"
                      onClick={() => { setSuEmailSent(false); setTab("signin"); }}>
                      กลับไปหน้าเข้าสู่ระบบ
                    </Button>
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={handleSignUp}>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-name">ชื่อที่จะแสดง</Label>
                      <Input id="su-name" value={suName}
                        onChange={(e) => setSuName(e.target.value)}
                        placeholder="เช่น Pim" autoComplete="name" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-email">อีเมล</Label>
                      <Input id="su-email" type="email" value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                        placeholder="your@email.com" autoComplete="email" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-password">รหัสผ่าน</Label>
                      <div className="relative">
                        <Input id="su-password" type={suShowPw ? "text" : "password"}
                          value={suPassword} onChange={(e) => setSuPassword(e.target.value)}
                          placeholder="อย่างน้อย 6 ตัวอักษร" autoComplete="new-password"
                          className="pr-10" required />
                        <button type="button" onClick={() => setSuShowPw((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                          {suShowPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-confirm">ยืนยันรหัสผ่าน</Label>
                      <Input id="su-confirm" type={suShowPw ? "text" : "password"}
                        value={suConfirm} onChange={(e) => setSuConfirm(e.target.value)}
                        placeholder="••••••••" autoComplete="new-password" required />
                    </div>
                    {suError && <ErrorBox>{suError}</ErrorBox>}
                    <Button type="submit" size="lg" className="mt-1 w-full" disabled={suLoading}>
                      {suLoading ? <Loader2 className="size-4 animate-spin" /> : "สมัครสมาชิก"}
                    </Button>
                  </form>
                )}
              </>
            )}

            <div className="mt-4 flex flex-col items-center gap-2">
              <button onClick={handleGuest}
                className="w-full rounded-md border-2 border-foreground bg-secondary px-3 py-2 text-center text-[14px] font-black text-foreground shadow-soft transition-all hover:bg-primary active:translate-x-1 active:translate-y-1 active:shadow-none">
                เข้าดูแผนที่ก่อนได้ →
              </button>
              <p className="text-[11px] text-muted-foreground">
                ไม่ต้องสมัคร ดูได้เลย แต่จะรีวิวหรือเพิ่มสถานที่ต้องล็อกอิน
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          By continuing, you agree to our Terms · v1.0
        </p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "flex-1 py-3 text-[14px] font-black transition-colors",
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
