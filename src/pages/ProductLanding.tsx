import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Star, Shield, Truck,
  Clock, Phone, MessageCircle, Users,
  XCircle, CheckCircle, ChevronDown, ChevronUp,
  Sparkles, BadgeCheck, HeartPulse, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import SEO, { SITE_URL } from "@/components/SEO";
import { products, testimonials } from "@/data/products";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { trackViewContent, trackAddToCart } from "@/lib/tracking";
import { sendServerEvent, genEventId } from "@/lib/capi";

const ProductLanding = () => {
  const { slug } = useParams();
  const { addToCart, isOrdered } = useCart();
  const navigate = useNavigate();
  const product = products.find((p) => p.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [viewers] = useState(Math.floor(Math.random() * 30) + 15);
  const productOrdered = product ? isOrdered(product.id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      const eid = genEventId();
      trackViewContent({ id: product.id, name: product.name, price: product.price, category: product.category }, eid);
      sendServerEvent({
        eventName: "ViewContent",
        eventId: eid,
        value: product.price,
        currency: "BDT",
        contentIds: [product.id],
        contentName: product.name,
        contentCategory: product.category,
      });
    }
  }, [slug, product]);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">পেজটি পাওয়া যায়নি</p>
          <Button className="mt-4" onClick={() => navigate("/products")}>সকল ঔষধ দেখুন</Button>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleOrder = () => {
    if (productOrdered) { toast.info("এই পণ্যটি ইতিমধ্যে অর্ডার করা হয়েছে।"); return; }
    addToCart(product);
    const eid = genEventId();
    trackAddToCart({ id: product.id, name: product.name, price: product.price, category: product.category }, 1, eid);
    sendServerEvent({
      eventName: "AddToCart",
      eventId: eid,
      value: product.price,
      currency: "BDT",
      contents: [{ id: product.id, quantity: 1, item_price: product.price }],
      contentName: product.name,
      contentCategory: product.category,
    });
    toast.success("অর্ডার প্রস্তুত! আপনার তথ্য দিন।");
    navigate("/checkout");
  };

  const relatedTestimonials = testimonials.filter(
    (t) => t.product === product.name || t.product === product.nameEn
  );
  const displayTestimonials = relatedTestimonials.length > 0 ? relatedTestimonials : testimonials.slice(0, 3);

  const whatsappNumber = "8801767678562";
  const whatsappMessage = encodeURIComponent(`আমি ${product.name} সম্পর্কে জানতে চাই।`);

  const problemPoints = product.problem.split("?").filter(Boolean).map(s => s.trim() + "?");

  const solutionPoints = [
    { icon: CheckCircle, title: "প্রাকৃতিক চিকিৎসা", desc: "১০০% প্রাকৃতিক ও পার্শ্বপ্রতিক্রিয়ামুক্ত উপাদান, কোনো ক্ষতি নেই" },
    { icon: CheckCircle, title: "দ্রুত কার্যকর", desc: "সঠিক নিয়মে ব্যবহার করলে দ্রুত ফলাফল পাওয়া যায়" },
    { icon: CheckCircle, title: "দীর্ঘ সমাধান", desc: "মূল সমস্যার শিকড় থেকে নিরাময় করে, বারবার ফিরে আসে না" },
    { icon: CheckCircle, title: "বিশেষজ্ঞ সেবা", desc: "ফ্রি ডাক্তারি পরামর্শ, সঠিক ডোজ আর ফলো-আপ নিশ্চিত করা হয়" },
  ];

  const benefitIcons = [HeartPulse, Shield, Sparkles, Zap];

  const expertOpinion = {
    name: "ডা. মাহমুদুল হাসান",
    title: "DHMS, হোমিওপ্যাথিক বিশেষজ্ঞ চিকিৎসক",
    phone: "☎ ফ্রি পরামর্শ পাবেন",
    quote: `"${product.name} হোমিওপ্যাথিতে একটি অত্যন্ত কার্যকর ও প্রমাণিত ঔষধ। আমি আমার প্র্যাকটিসে দীর্ঘদিন ধরে এটি সফলভাবে ব্যবহার করছি এবং রোগীরা চমৎকার ফলাফল পাচ্ছেন।"`,
    stats: [
      { label: "সফলতা সন্তুষ্টি", value: "৯৫%+ সন্তুষ্টি" },
      { label: "অভিজ্ঞতা", value: "১৫০ হাজার রোগী" },
    ],
  };

  const faqs = [
    { q: "এই ঔষধ কি নিরাপদ?", a: "হ্যাঁ, সম্পূর্ণ প্রাকৃতিক ও পার্শ্বপ্রতিক্রিয়ামুক্ত হোমিওপ্যাথিক ঔষধ।" },
    { q: "কত দিনে ফলাফল পাবো?", a: "সাধারণত ২-৪ সপ্তাহের মধ্যে উন্নতি দেখা যায়। সম্পূর্ণ ফলাফলের জন্য ২-৩ মাস ব্যবহার করুন।" },
    { q: "ডেলিভারি কিভাবে হবে?", a: "সারাদেশে কুরিয়ারে ২-৫ কর্মদিবসে পৌঁছে যাবে। Cash on Delivery — আগে পণ্য দেখুন, তারপর পেমেন্ট করুন।" },
    { q: "অন্য ঔষধের সাথে খাওয়া যাবে?", a: "হোমিওপ্যাথিক ঔষধ অন্য ঔষধের সাথে নিরাপদে খাওয়া যায়। তবে ডাক্তারের পরামর্শ নিন।" },
    { q: "ডাক্তারের পরামর্শ কি ফ্রি?", a: "হ্যাঁ! অর্ডার করলে বিশেষজ্ঞ ডাক্তারের ফ্রি পরামর্শ পাবেন।" },
  ];

  return (
    <div className="min-h-screen bg-background font-bengali">
      <SEO
        title={`${product.name} - ${product.problem.split("?")[0]}? সমাধান পান`}
        description={`${product.name} (${product.nameEn}) - ${product.solution.slice(0, 100)}। মূল্য: ৳${product.price}। ১০০% প্রাকৃতিক হোমিওপ্যাথিক ঔষধ। অর্ডার করুন।`}
        canonical={`${SITE_URL}/${product.slug}`}
        ogImage={product.image}
        ogType="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.solution,
          image: product.image,
          brand: { "@type": "Brand", name: "বিসমিল্লাহ হোমিও চেম্বার" },
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "BDT",
            availability: "https://schema.org/InStock",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
          },
        }}
      />

      {/* ═══ HERO SECTION ═══ */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background pb-2 pt-6">
        <div className="mx-auto max-w-md px-4 text-center">

          {/* Category tag */}
          <span className="inline-block rounded-full bg-primary px-4 py-1 text-[11px] font-bold tracking-wide text-primary-foreground">
            New
          </span>

          {/* Problem headline */}
          <h1 className="mt-3 text-[22px] font-extrabold leading-tight text-foreground">
            {product.problem.split("?")[0]}?
            <br />
            <span className="text-primary">এখন সমাধান আপনার হাতে!</span>
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Complete protection for your family
          </p>

          {/* Product Image */}
          <div className="relative mx-auto mt-5 h-48 w-48">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full rounded-2xl object-cover shadow-lg"
              loading="eager"
            />
          </div>

          {/* Trust pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-primary">
              <CheckCircle className="h-3 w-3" /> ১০০% অরিজিনাল
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-primary">
              <Shield className="h-3 w-3" /> গ্যারান্টিযুক্ত মূল্য
            </span>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="text-3xl font-extrabold text-foreground">৳{product.price}</span>
            {product.originalPrice && (
              <span className="text-base text-muted-foreground line-through">৳{product.originalPrice}</span>
            )}
            {discount > 0 && (
              <span className="rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                {discount}% ছাড়!
              </span>
            )}
          </div>

          {/* CTA Buttons */}
          <Button
            size="lg"
            className="mt-4 h-[52px] w-full gap-2 rounded-xl gradient-primary text-[15px] font-extrabold text-primary-foreground shadow-lg active:scale-[0.98]"
            onClick={handleOrder}
          >
            <ShoppingCart className="h-5 w-5" /> এখনই অর্ডার করুন
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="mt-2.5 h-[48px] w-full gap-2 rounded-xl border-primary/40 text-sm font-bold text-primary hover:bg-primary/5"
            asChild
          >
            <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
              <Phone className="h-4 w-4" /> ফ্রি কনসালটেশন নিন
            </a>
          </Button>
        </div>
      </section>

      {/* ═══ PROBLEM SECTION ═══ */}
      <section className="py-8">
        <div className="mx-auto max-w-md px-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
            😟 আপনিও কি এই সমস্যায় ভুগছেন?
          </h2>
          <div className="mt-4 space-y-2.5">
            {problemPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-destructive/15 bg-destructive/5 px-4 py-3">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-[13px] leading-relaxed text-foreground">{point}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-center text-xs font-semibold leading-relaxed text-foreground">
            এই সমস্যাগুলো উপেক্ষা করলে পরিস্থিতি আরো জটিল হতে পারে। <span className="font-extrabold text-primary">এখনই সমাধান নিন!</span>
          </p>
        </div>
      </section>

      {/* ═══ SOLUTION SECTION ═══ */}
      <section className="border-y border-border bg-secondary/50 py-8">
        <div className="mx-auto max-w-md px-4">
          <h2 className="text-lg font-extrabold text-foreground">
            ✅ {product.name} — আপনার সমাধান
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">এটি কিভাবে কাজ করে দেখুন</p>
          <div className="mt-4 space-y-2.5">
            {solutionPoints.map((sp, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-primary/15 bg-card px-4 py-3 shadow-sm">
                <sp.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-[13px] font-bold text-foreground">{sp.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{sp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS GRID ═══ */}
      <section className="py-10">
        <div className="mx-auto max-w-md px-4">
          <div className="text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-[11px] font-bold text-primary">উপকারিতা</span>
            <h2 className="mt-3 text-xl font-extrabold text-foreground">
              🌿 কী কী উপকার পাবেন?
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">প্রতিটি উপকারিতা বৈজ্ঞানিকভাবে প্রমাণিত</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {product.benefits.map((b, i) => {
              const Icon = benefitIcons[i % benefitIcons.length];
              const colors = [
                "from-primary/15 to-primary/5 border-primary/25",
                "from-accent/15 to-accent/5 border-accent/25",
                "from-destructive/10 to-destructive/5 border-destructive/20",
                "from-primary/10 to-accent/5 border-primary/20",
              ];
              const iconColors = ["text-primary", "text-accent", "text-destructive", "text-primary"];
              const iconBgs = ["bg-primary/15", "bg-accent/15", "bg-destructive/10", "bg-primary/10"];
              return (
                <div key={i} className={`rounded-2xl border bg-gradient-to-br ${colors[i % colors.length]} p-4 text-center shadow-sm`}>
                  <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${iconBgs[i % iconBgs.length]} shadow-sm`}>
                    <Icon className={`h-5 w-5 ${iconColors[i % iconColors.length]}`} />
                  </div>
                  <p className="mt-3 text-[12px] font-bold leading-snug text-foreground">{b}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ MID CTA ═══ */}
      <section className="py-1">
        <div className="mx-auto max-w-md px-4">
          <Button
            size="lg"
            className="h-[52px] w-full gap-2 rounded-xl gradient-primary text-[15px] font-extrabold text-primary-foreground shadow-lg active:scale-[0.98]"
            onClick={handleOrder}
          >
            <ShoppingCart className="h-5 w-5" /> এখনই অর্ডার করুন
          </Button>
        </div>
      </section>

      {/* ═══ INGREDIENTS SECTION ═══ */}
      <section className="py-10">
        <div className="mx-auto max-w-md px-4">
          <div className="overflow-hidden rounded-2xl border-2 border-primary/20 shadow-sm">
            {/* Header */}
            <div className="gradient-primary px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-primary-foreground">
                🧪 উপাদান সমূহ
              </h2>
              <p className="mt-0.5 text-[11px] text-primary-foreground/80">১০০% প্রাকৃতিক ও নিরাপদ উপাদান</p>
            </div>
            {/* Content */}
            <div className="bg-gradient-to-b from-primary/5 to-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">{product.ingredients}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">কোনো রাসায়নিক বা পার্শ্বপ্রতিক্রিয়াযুক্ত উপাদান নেই</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
                  <CheckCircle className="h-3 w-3" /> GMP সার্টিফাইড
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-[10px] font-semibold text-accent-foreground">
                  <Shield className="h-3 w-3 text-accent" /> ল্যাব টেস্টেড
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
                  <CheckCircle className="h-3 w-3" /> WHO মানসম্পন্ন
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ EXPERT DOCTOR SECTION ═══ */}
      <section className="border-y border-border bg-secondary/50 py-10">
        <div className="mx-auto max-w-md px-4">
          <h2 className="text-center text-lg font-extrabold text-foreground">
            🩺 বিশেষজ্ঞ ডাক্তারের পরামর্শ
          </h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Doctor info with colored header */}
            <div className="gradient-primary p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-xl font-bold text-primary-foreground shadow-md ring-2 ring-primary-foreground/30">
                  ড
                </div>
                <div>
                  <p className="text-sm font-extrabold text-primary-foreground">{expertOpinion.name}</p>
                  <p className="text-[11px] text-primary-foreground/80">{expertOpinion.title}</p>
                  <p className="text-[11px] font-semibold text-primary-foreground/90">{expertOpinion.phone}</p>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="p-5">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-[13px] italic leading-relaxed text-foreground">
                  {expertOpinion.quote}
                </p>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {expertOpinion.stats.map((s, i) => (
                  <div key={i} className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 px-3 py-3 text-center">
                    <p className="text-xs font-extrabold text-primary">{s.value}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CUSTOMER REVIEWS ═══ */}
      <section className="py-10">
        <div className="mx-auto max-w-md px-4">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1 text-[11px] font-bold text-accent-foreground">সোশ্যাল প্রুফ</span>
            <h2 className="mt-3 text-lg font-extrabold text-foreground">
              ⭐ গ্রাহকদের মতামত
            </h2>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-gold text-gold" />
            ))}
            <span className="ml-1.5 text-xs font-bold text-foreground">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviews}+ রিভিউ)</span>
          </div>

          <div className="mt-5 space-y-3">
            {displayTestimonials.map((t) => (
              <div key={t.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground shadow-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">📍 {t.location} • ✅ ভেরিফাইড ক্রেতা</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3.5">
                  <p className="text-[12px] italic leading-relaxed text-foreground">"{t.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ USAGE SECTION ═══ */}
      <section className="border-y border-border bg-secondary/50 py-10">
        <div className="mx-auto max-w-md px-4">
          <div className="text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-[11px] font-bold text-primary">গাইড</span>
            <h2 className="mt-3 text-xl font-extrabold text-foreground">
              📋 ব্যবহারের নিয়ম
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">সঠিক নিয়মে ব্যবহার করুন, দ্রুত ফলাফল পান</p>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-sm">
            <div className="gradient-primary px-5 py-3">
              <p className="text-[13px] font-bold text-primary-foreground">✅ সেবনবিধি</p>
            </div>
            <div className="bg-gradient-to-b from-primary/5 to-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <p className="text-[13px] font-medium leading-relaxed text-foreground">{product.usage}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-primary/5 p-2.5 text-center">
                  <p className="text-lg">🕐</p>
                  <p className="mt-1 text-[10px] font-bold text-foreground">সকালে</p>
                </div>
                <div className="rounded-xl bg-accent/5 p-2.5 text-center">
                  <p className="text-lg">🕐</p>
                  <p className="mt-1 text-[10px] font-bold text-foreground">দুপুরে</p>
                </div>
                <div className="rounded-xl bg-primary/5 p-2.5 text-center">
                  <p className="text-lg">🕐</p>
                  <p className="mt-1 text-[10px] font-bold text-foreground">রাতে</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-[11px] font-semibold text-destructive">⚠️ সতর্কতা: খাওয়ার ১৫ মিনিট আগে বা পরে সেবন করুন। ডাক্তারের পরামর্শ অনুযায়ী ব্যবহার করুন।</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL OFFER CTA ═══ */}
      <section className="py-6">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl gradient-offer p-6 text-center text-destructive-foreground shadow-xl">
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">সীমিত সময়ের অফার</p>
            {discount > 0 && (
              <p className="mt-2 text-3xl font-extrabold">{discount}% ছাড়!</p>
            )}
            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="text-3xl font-extrabold">৳{product.price}</span>
              {product.originalPrice && (
                <span className="text-base opacity-60 line-through">৳{product.originalPrice}</span>
              )}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] opacity-90">
              <span>✅ ফ্রি ডেলিভারি</span>
              <span>✅ ফ্রি পরামর্শ</span>
              <span>✅ ১০০% আসল</span>
            </div>
            <Button
              size="lg"
              className="mt-4 h-[52px] w-full gap-2 rounded-xl bg-card text-[15px] font-extrabold text-destructive shadow-lg hover:bg-card/90 active:scale-[0.98]"
              onClick={handleOrder}
            >
              <ShoppingCart className="h-5 w-5" /> এখনই অর্ডার করুন
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="border-t border-border bg-secondary/50 py-8">
        <div className="mx-auto max-w-md px-4">
          <h2 className="text-center text-lg font-extrabold text-foreground">
            ❓ সচরাচর জিজ্ঞাসা
          </h2>
          <div className="mt-5 space-y-2">
            {faqs.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <button
                  className="flex w-full items-center justify-between p-3.5 text-left text-[13px] font-bold text-foreground"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {f.q}
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="border-t border-border px-3.5 pb-3.5 pt-2.5">
                    <p className="text-xs leading-relaxed text-muted-foreground">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GUARANTEE ═══ */}
      <section className="py-8">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-3 text-base font-extrabold text-foreground">১০০% সন্তুষ্টি গ্যারান্টি</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              প্রতিটি ঔষধ ১০০% আসল ও কার্যকর। সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত পাবেন।
            </p>
          </div>
        </div>
      </section>

      {/* ═══ MINI FOOTER ═══ */}
      <footer className="border-t border-border bg-card py-5 text-center">
        <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} HomeoCare — বিশ্বস্ত হোমিওপ্যাথিক চিকিৎসা</p>
        <div className="mt-1.5 flex justify-center gap-4 text-[11px]">
          <a href="/privacy" className="text-muted-foreground hover:text-primary">প্রাইভেসি</a>
          <a href="/terms" className="text-muted-foreground hover:text-primary">শর্তাবলী</a>
          <a href="/return-policy" className="text-muted-foreground hover:text-primary">রিটার্ন</a>
        </div>
      </footer>

      {/* ═══ FLOATING WHATSAPP ═══ */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-primary-foreground shadow-lg transition-transform hover:scale-110 md:bottom-6 md:right-6 md:h-14 md:w-14"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* ═══ STICKY BOTTOM CTA (Mobile) ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-primary">৳{product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">৳{product.originalPrice}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">💵 Cash on Delivery</p>
          </div>
          <Button
            className="h-11 flex-1 gap-1.5 rounded-lg gradient-primary text-sm font-extrabold text-primary-foreground"
            onClick={handleOrder}
          >
            <ShoppingCart className="h-4 w-4" /> অর্ডার করুন
          </Button>
        </div>
      </div>

      {/* Bottom spacing for sticky bar */}
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default ProductLanding;
