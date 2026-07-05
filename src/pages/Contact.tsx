import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SEO, { SITE_URL } from "@/components/SEO";
import { toast } from "sonner";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("আপনার মেসেজ পাঠানো হয়েছে!");
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
          <div><Label htmlFor="name">নাম *</Label><Input id="name" required /></div>
          <div><Label htmlFor="email">ইমেইল</Label><Input id="email" type="email" /></div>
          <div><Label htmlFor="phone">ফোন *</Label><Input id="phone" required type="tel" /></div>
          <div><Label htmlFor="message">মেসেজ *</Label><Textarea id="message" required rows={4} /></div>
          <Button type="submit" className="w-full">পাঠান</Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
