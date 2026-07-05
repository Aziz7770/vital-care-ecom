import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, LogIn, UserPlus } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin/orders", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("সঠিক ইমেইল ও কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/orders` },
        });
        if (error) throw error;
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে! লগইন হচ্ছে...");
        navigate("/admin/orders", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("সফলভাবে লগইন হয়েছে");
        navigate("/admin/orders", { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "সমস্যা হয়েছে";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">অ্যাডমিন {mode === "login" ? "লগইন" : "সাইনআপ"}</h1>
          <p className="text-xs text-muted-foreground text-center">
            শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">ইমেইল</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {mode === "login" ? <><LogIn className="h-4 w-4 mr-2" />লগইন করুন</> : <><UserPlus className="h-4 w-4 mr-2" />অ্যাকাউন্ট তৈরি করুন</>}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-xs text-primary hover:underline"
          >
            {mode === "login" ? "প্রথমবার? অ্যাডমিন অ্যাকাউন্ট তৈরি করুন" : "অ্যাকাউন্ট আছে? লগইন করুন"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
