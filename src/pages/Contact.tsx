import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SEO, { SITE_URL } from "@/components/SEO";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trackSubmitForm } from "@/lib/tracking";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const fields = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };

    if (!fields.name || !fields.phone || !fields.message) {
      toast.error("সব প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("notify-form", {
        body: { type: "contact", fields },
      });
      if (error || !data?.success) throw error || new Error("Failed");
      trackSubmitForm("Contact");
      toast.success("আপনার মেসেজ পাঠানো হয়েছে!");
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("দুঃখিত, পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <SEO
        title="যোগাযোগ করুন"
        description="বিসমিল্লাহ হোমিও চেম্বারে যোগাযোগ করুন। ফোন: ০১৭৬৭৬৭৮৫৬২। ঠিকানা: গোপালগঞ্জ, কাশিয়ানী। দিবা রাত্রি সেবা চালু।"
        canonical={`${SITE_URL}/contact`}
      />
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">যোগাযোগ করুন</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Phone, title: "ফোন", desc: "০১৭৬৭৬৭৮৫৬২" },
            { icon: Mail, title: "ইমেইল", desc: "bismillahhomeochamber@gmail.com" },
            { icon: MapPin, title: "ঠিকানা", desc: "গোপালগঞ্জ, কাশিয়ানী উপজেলা কেন্দ্রীয় জামে মসজিদ সংলগ্ন" },
            { icon: Clock, title: "সময়সূচী", desc: "দিবা রাত্রি সেবা চালু" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">মেসেজ পাঠান</h3>
          <div><Label htmlFor="name">নাম *</Label><Input id="name" name="name" required /></div>
          <div><Label htmlFor="email">ইমেইল</Label><Input id="email" name="email" type="email" /></div>
          <div><Label htmlFor="phone">ফোন *</Label><Input id="phone" name="phone" required type="tel" /></div>
          <div><Label htmlFor="message">মেসেজ *</Label><Textarea id="message" name="message" required rows={4} /></div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "পাঠানো হচ্ছে..." : "পাঠান"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
