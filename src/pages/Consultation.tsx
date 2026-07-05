import { useEffect } from "react";
import { Phone, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SEO, { SITE_URL } from "@/components/SEO";
import doctorImg from "@/assets/doctor-consultation.jpg";
import { toast } from "sonner";

const Consultation = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("আপনার পরামর্শের অনুরোধ পাঠানো হয়েছে! শীঘ্রই ডাক্তার যোগাযোগ করবেন।");
  };

  return (
    <div className="container py-8">
      <SEO
        title="ফ্রি ডাক্তার পরামর্শ - হোমিওপ্যাথিক বিশেষজ্ঞ"
        description="অভিজ্ঞ হোমিওপ্যাথিক ডাক্তারের কাছ থেকে সম্পূর্ণ বিনামূল্যে পরামর্শ নিন। ফোন ও WhatsApp এ পরামর্শ পাওয়া যায়। BHMS ও DHMS ডিগ্রিধারী ডাক্তার।"
        canonical={`${SITE_URL}/consultation`}
      />
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">ডাক্তার পরামর্শ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            আমাদের অভিজ্ঞ হোমিওপ্যাথিক ডাক্তারের কাছ থেকে সম্পূর্ণ বিনামূল্যে পরামর্শ নিন।
          </p>

          <div className="mt-6 space-y-4">
            {[
              { icon: Phone, title: "ফোনে পরামর্শ", desc: "০১৭৬৭৬৭৮৫৬২ নম্বরে কল করুন" },
              { icon: MessageCircle, title: "WhatsApp পরামর্শ", desc: "WhatsApp-এ মেসেজ পাঠান" },
              { icon: Clock, title: "সময়সূচী", desc: "সকাল ১০টা - রাত ১০টা (প্রতিদিন)" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <img src={doctorImg} alt="ডাক্তার" className="mt-6 w-full rounded-2xl object-cover" loading="lazy" width={800} height={600} />
        </div>

        <div>
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">পরামর্শের জন্য আবেদন</h3>
            <div><Label htmlFor="name">আপনার নাম *</Label><Input id="name" required placeholder="পূর্ণ নাম" /></div>
            <div><Label htmlFor="phone">মোবাইল নম্বর *</Label><Input id="phone" required placeholder="০১XXXXXXXXX" type="tel" /></div>
            <div><Label htmlFor="age">বয়স *</Label><Input id="age" required placeholder="যেমন: ২৫" type="number" min="1" max="120" /></div>
            <div><Label htmlFor="problem">আপনার সমস্যা *</Label><Textarea id="problem" required placeholder="আপনার সমস্যা বিস্তারিত লিখুন..." rows={5} /></div>
            <div><Label htmlFor="duration">কতদিন ধরে সমস্যা?</Label><Input id="duration" placeholder="যেমন: ৬ মাস" /></div>
            <Button type="submit" size="lg" className="w-full">পরামর্শের অনুরোধ পাঠান</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Consultation;
