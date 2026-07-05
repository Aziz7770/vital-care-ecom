import { Shield, Award, Heart, Users } from "lucide-react";
import SEO, { SITE_URL } from "@/components/SEO";

const About = () => (
  <div className="container py-8">
    <SEO
      title="আমাদের সম্পর্কে"
      description="বিসমিল্লাহ হোমিও চেম্বার - ১০+ বছরের অভিজ্ঞতা, BHMS ও DHMS ডিগ্রিধারী ডাক্তার, ৫০০০+ সন্তুষ্ট গ্রাহক। বাংলাদেশের বিশ্বস্ত হোমিওপ্যাথিক চিকিৎসা প্রতিষ্ঠান।"
      canonical={`${SITE_URL}/about`}
    />
    <h1 className="text-2xl font-bold text-foreground md:text-3xl">আমাদের সম্পর্কে</h1>
    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
      বিসমিল্লাহ হোমিও চেম্বার বাংলাদেশের সেরা হোমিওপ্যাথিক ঔষধের অনলাইন শপ। আমরা ১০০% আসল ও কার্যকর হোমিওপ্যাথিক ঔষধ সরাসরি আপনার ঘরে পৌঁছে দিই।
      আমাদের অভিজ্ঞ ডাক্তারগণ আপনার সমস্যা অনুযায়ী সঠিক ঔষধ নির্বাচন করে দেন।
    </p>

    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { icon: Shield, title: "১০০% নির্ভরযোগ্য প্রতিষ্ঠান", desc: "আমরা অরজিনাল হোমিওপ্যাথিক ঔষধ সরবরাহ করি, যাতে আপনি পান নিরাপদ ও কার্যকর চিকিৎসা।" },
        { icon: Award, title: "১০+ বছরের অভিজ্ঞতা", desc: "হোমিওপ্যাথিক চিকিৎসা ক্ষেত্রে আমাদের ১০ বছরেরও বেশি অভিজ্ঞতা রয়েছে, যা আমাদের সেবাকে করেছে আরও বিশ্বস্ত ও কার্যকর।" },
        { icon: Heart, title: "গ্রাহকের আস্থা ও সন্তুষ্টি", desc: "হাজার হাজার সন্তুষ্ট রোগীদের বিশ্বাসই আমাদের সবচেয়ে বড় অর্জন। আমরা সর্বদা সেরা সেবা দিতে প্রতিশ্রুতিবদ্ধ।" },
        { icon: Users, title: "অভিজ্ঞ বিশেষজ্ঞ টিম", desc: "আমাদের রয়েছে BHMS ও DHMS ডিগ্রিধারী দক্ষ ও অভিজ্ঞ চিকিৎসকদের একটি পেশাদার টিম, যারা আপনাকে সঠিক পরামর্শ প্রদান করে।" },
      ].map((item) => (
        <div key={item.title} className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <item.icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>

    <div className="mt-12 rounded-2xl gradient-primary p-8 text-center">
      <h2 className="text-xl font-bold text-primary-foreground md:text-2xl">আমাদের লক্ষ্য</h2>
      <p className="mt-3 mx-auto max-w-xl text-sm text-primary-foreground/80">
        প্রতিটি মানুষের কাছে সাশ্রয়ী মূল্যে আসল ও কার্যকর হোমিওপ্যাথিক চিকিৎসা পৌঁছে দেওয়া। পার্শ্বপ্রতিক্রিয়াহীন প্রাকৃতিক চিকিৎসায় সুস্থ বাংলাদেশ গড়ে তোলা।
      </p>
    </div>
  </div>
);

export default About;
