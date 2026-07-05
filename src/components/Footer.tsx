import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid gap-8 sm:grid-cols-2">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="বিসমিল্লাহ হোমিও চেম্বার" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-lg font-bold text-foreground">বিসমিল্লাহ হোমিও চেম্বার</span>
          </div>
          <p className="text-sm text-muted-foreground">
            বাংলাদেশের সেরা হোমিওপ্যাথিক ঔষধের অনলাইন শপ। ১০০% আসল ও কার্যকর ঔষধ।
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">যোগাযোগ</h3>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <a href="tel:01767678562" className="flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4 text-primary" /> ০১৭৬৭৬৭৮৫৬২</a>
            <a href="mailto:bismillahhomeochamber@gmail.com" className="flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4 text-primary" /> bismillahhomeochamber@gmail.com</a>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> গোপালগঞ্জ, কাশিয়ানী উপজেলা কেন্দ্রীয় জামে মসজিদ সংলগ্ন</span>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
      © ২০২৬ বিসমিল্লাহ হোমিও চেম্বার। সর্বস্বত্ব সংরক্ষিত।
    </div>
  </footer>
);

export default Footer;
