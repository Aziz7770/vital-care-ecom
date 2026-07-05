import { Link } from "react-router-dom";
import { ArrowRight, Star, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import TrustBadges from "@/components/TrustBadges";
import SEO, { SITE_URL } from "@/components/SEO";
import { products, categories, testimonials } from "@/data/products";
import heroBanner from "@/assets/hero-banner.jpg";
import doctorImg from "@/assets/hero-doctor.jpg";

const Index = () => {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div className="min-h-screen">
      <SEO
        title="বিসমিল্লাহ হোমিও চেম্বার - হোমিওপ্যাথিক ঔষধের অনলাইন শপ"
        description="বিসমিল্লাহ হোমিও চেম্বার - আপনার সুস্থতার বিশ্বস্ত সঙ্গী। গ্যাস, এসিডিটি, হজমের সমস্যাসহ বিভিন্ন রোগের কার্যকর হোমিওপ্যাথিক ঔষধ। ৫০০০+ সন্তুষ্ট গ্রাহক। ফ্রি ডাক্তার পরামর্শ।"
        canonical={SITE_URL}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "বিসমিল্লাহ হোমিও চেম্বার",
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/products?search={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="হোমিওপ্যাথি" className="h-full w-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
        </div>
        <div className="container relative py-12 md:py-20">
         <div className="max-w-lg">
            <h2 className="text-3xl font-extrabold leading-tight text-primary-foreground md:text-5xl">
              প্রাকৃতিক চিকিৎসায় গড়ে তুলুন <span className="text-gold">সুস্থ জীবন</span>
            </h2>
            <p className="mt-4 text-base text-primary-foreground/90 md:text-lg">
              বিসমিল্লাহ হোমিও চেম্বার আপনাদের বিশ্বাস এবং আস্থার জায়গা। বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন সম্পূর্ণ ফ্রি।
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/products">
                  ঔষধ দেখুন <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-gold text-foreground hover:bg-gold/90">
                <Link to="/consultation">ফ্রি পরামর্শ নিন</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* Categories */}
      <section className="container py-12">
        <h2 className="text-center text-2xl font-bold text-foreground">ক্যাটাগরি অনুযায়ী ঔষধ</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">আপনার সমস্যা অনুযায়ী সঠিক ঔষধ খুঁজুন</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className={`flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center transition-all hover:shadow-card ${cat.color}`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-semibold">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-secondary py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">জনপ্রিয় ঔষধসমূহ</h2>
              <p className="mt-1 text-sm text-muted-foreground">সবচেয়ে বেশি বিক্রিত ঔষধ</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/products">সব দেখুন</Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>


      {/* Doctor Consultation */}
      <section className="container py-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-primary">বিশেষজ্ঞ পরামর্শ</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              অভিজ্ঞ হোমিওপ্যাথিক ডাক্তারের <span className="text-primary">ফ্রি পরামর্শ</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              আমাদের অভিজ্ঞ ডাক্তারগণ আপনার সমস্যা শুনে সঠিক ঔষধ নির্বাচন করে দেবেন। ফোন বা অনলাইনে পরামর্শ নিন সম্পূর্ণ বিনামূল্যে।
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              {["BHMS ও DHMS ডিগ্রিধারী ডাক্তার", "১০+ বছরের অভিজ্ঞতা", "ফোন ও অনলাইনে পরামর্শ", "সম্পূর্ণ বিনামূল্যে"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-6">
              <Link to="/consultation">পরামর্শ নিন</Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img src={doctorImg} alt="ডাক্তার পরামর্শ" className="w-full object-cover" loading="lazy" width={800} height={600} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary py-12">
        <div className="container">
          <h2 className="text-center text-2xl font-bold text-foreground">কাস্টমার রিভিউ</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">আমাদের সন্তুষ্ট গ্রাহকদের মতামত</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-3 text-sm text-foreground">"{t.text}"</p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location} • {t.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
