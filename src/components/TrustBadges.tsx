import { Shield, Truck, Clock, Award } from "lucide-react";

const badges = [
  { icon: Shield, label: "১০০% রোগ মুক্তি", sub: "নিশ্চিত গ্যারান্টি" },
  { icon: Truck, label: "দ্রুত ডেলিভারি", sub: "সারাদেশে ২-৩ দিন" },
  { icon: Clock, label: "২৪/৭ সাপোর্ট", sub: "যেকোনো সময় কল করুন" },
  { icon: Award, label: "বিশেষজ্ঞ ডাক্তার", sub: "ফ্রি পরামর্শ" },
];

const TrustBadges = () => (
  <section className="border-y border-border bg-secondary py-6">
    <div className="container grid grid-cols-2 gap-4 md:grid-cols-4">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <b.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{b.label}</p>
            <p className="text-[10px] text-muted-foreground">{b.sub}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TrustBadges;
