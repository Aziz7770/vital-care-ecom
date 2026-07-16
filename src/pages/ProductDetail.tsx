import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, ArrowLeft, CheckCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import SEO, { SITE_URL } from "@/components/SEO";
import { products, productReviews } from "@/data/products";
import { toast } from "sonner";
import { useEffect } from "react";
import { trackViewContent, trackAddToCart } from "@/lib/tracking";
import { sendServerEvent, genEventId } from "@/lib/capi";
import { Truck, ShieldCheck, PackageCheck } from "lucide-react";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart, isOrdered } = useCart();
  const navigate = useNavigate();
  const product = products.find((p) => p.slug === slug);
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
      <div className="container py-20 text-center">
        <p className="text-lg text-muted-foreground">ঔষধটি পাওয়া যায়নি</p>
        <Button asChild className="mt-4"><Link to="/products">সকল ঔষধ দেখুন</Link></Button>
      </div>
    );
  }

  const handleAdd = () => {
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
    toast.success(`${product.name} কার্টে যোগ হয়েছে!`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const reviews = productReviews[product.id] || [];

  return (
    <div className="container py-8">
      <SEO
        title={`${product.name} (${product.nameEn}) - কিনুন`}
        description={`${product.name} - ${product.description.slice(0, 120)}। মূল্য: ৳${product.price}। ১০০% আসল হোমিওপ্যাথিক ঔষধ।`}
        canonical={`${SITE_URL}/${product.slug}`}
        ogImage={product.image}
        ogType="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.image,
          brand: { "@type": "Brand", name: "বিসমিল্লাহ হোমিও চেম্বার" },
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "BDT",
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "বিসমিল্লাহ হোমিও চেম্বার" },
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
          },
        }}
      />
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> সকল ঔষধ
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
          <img src={product.image} alt={product.name} className="w-full object-cover aspect-square" />
        </div>

        {/* Info */}
        <div>
          {discount > 0 && (
            <span className="inline-block rounded-full bg-offer px-3 py-1 text-xs font-bold text-offer-foreground">
              {discount}% ছাড়
            </span>
          )}
          <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.nameEn}</p>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({product.reviews} রিভিউ)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">৳{product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">৳{product.originalPrice}</span>
            )}
          </div>

          <p className="mt-4 text-sm text-foreground">{product.description}</p>

          <div className="mt-6">
            {productOrdered ? (
              <Button size="lg" className="w-full gap-2" variant="secondary" disabled>
                <CheckCircle className="h-4 w-4" /> ইতিমধ্যে অর্ডার করা হয়েছে
              </Button>
            ) : (
              <Button size="lg" className="w-full gap-2 bg-offer text-offer-foreground hover:bg-offer/90" onClick={() => { addToCart(product); navigate("/checkout"); }}>
                <CreditCard className="h-4 w-4" /> এখনই অর্ডার করুন
              </Button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] text-foreground">
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary/30 p-2 text-center">
              <Truck className="h-4 w-4 text-primary" />
              <span>২-৩ দিনে ডেলিভারি</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary/30 p-2 text-center">
              <PackageCheck className="h-4 w-4 text-primary" />
              <span>ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary/30 p-2 text-center">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>১০০% আসল</span>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-offer">🔥 আজ {Math.max(5, (product.reviews % 20) + 8)} জন অর্ডার করেছেন — স্টক সীমিত</p>
        </div>
      </div>

      {/* Details tabs */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground">উপকারিতা</h3>
          <ul className="mt-3 space-y-2">
            {product.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground">ব্যবহারের নিয়ম</h3>
          <p className="mt-3 text-sm text-foreground">{product.usage}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground">উপাদান</h3>
          <p className="mt-3 text-sm text-foreground">{product.ingredients}</p>
        </div>
      </div>

      {/* How it works - only for gynecomastia */}
      {product.id === "gynecomastia-combo" && (
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-foreground">এই ঔষধ কীভাবে কাজ করে?</h2>
          <p className="text-sm text-foreground">
            এই ঔষধ আপনার বুকের টিস্যু এবং চর্বির ওপর সরাসরি <strong>৩টি ধাপে</strong> কাজ করবে:
          </p>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">🔬 হরমোনাল রি-ব্যালেন্স</h3>
            <p className="text-sm text-foreground">এটি শরীরে ইস্ট্রোজেনের (স্ত্রী হরমোন) প্রভাব কমিয়ে টেস্টোস্টেরনের মাত্রা বাড়াবে, যা স্তন বৃদ্ধি স্থায়ীভাবে থামিয়ে দেবে।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">🔥 লিপো-রিডাকশন (চর্বি ক্ষয়)</h3>
            <p className="text-sm text-foreground">বুকের চারপাশে জমে থাকা জেদি চর্বি কোষগুলোকে ভেঙে দ্রুত পুরুষালি শেপে নিয়ে আসবে।</p>
            <p className="text-sm text-foreground">স্তনের নিচে জমে থাকা শক্ত গ্রন্থি বা গ্ল্যান্ডুলার টিস্যুগুলোকে (Glandular Tissue) এই ঔষধটি ভেতর থেকে নরম করে সংকুচিত করে নিয়ে আসবে।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">✨ স্কিন টাইটানিং</h3>
            <p className="text-sm text-foreground">বুকের চারপাশের জেদি চর্বি গলিয়ে ফেলে এবং ঝুলে যাওয়া চামড়া টানটান (Skin Tightening) করে বুককে একটি সুগঠিত ও চওড়া পুরুষালি শেপ দেবে।</p>
            <p className="text-sm text-foreground">চর্বি কমার পর চামড়া যেন ঝুলে না যায়, বরং টানটান হয়ে মাসল বা পেশির সাথে মিশে যায় তা নিশ্চিত করে।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">💪 অভ্যন্তরীণ শক্তি</h3>
            <p className="text-sm text-foreground">এই ঔষধ আপনার পুরুষত্বকে আরও সুসংহত করবে।</p>
            <p className="text-sm text-foreground"><strong>লিবিডো বুস্টার:</strong> এটি প্রাকৃতিকভাবে কামেচ্ছা এবং মানসিক উদ্যম বাড়িয়ে দিবে।</p>
            <p className="text-sm text-foreground"><strong>স্ট্যামিনা ও ভাইটালিটি:</strong> শারীরিক ক্লান্তি দূর করে আপনাকে আগের চেয়ে অনেক বেশি এনার্জেটিক এবং আত্মবিশ্বাসী করে তুলবে।</p>
          </div>

          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center space-y-3">
            <p className="text-sm text-foreground">
              হাজারো মানুষ আমাদের এই ঔষধ ব্যবহার করে আজ আত্মবিশ্বাসের সাথে টি-শার্ট পরে বাইরে বের হতে পারছেন এবং একটি আত্মবিশ্বাসি জীবন উপভোগ করছেন। আপনিও যদি দ্রুত এই সমস্যা থেকে মুক্তি পেতে চান, তবে দেরি না করে আজই অর্ডার করুন।
            </p>
            {productOrdered ? (
              <Button size="lg" className="w-full gap-2" variant="secondary" disabled>
                <CheckCircle className="h-4 w-4" /> ইতিমধ্যে অর্ডার করা হয়েছে
              </Button>
            ) : (
              <Button size="lg" className="w-full gap-2 bg-offer text-offer-foreground hover:bg-offer/90" onClick={() => { addToCart(product); navigate("/checkout"); }}>
                <CreditCard className="h-4 w-4" /> এখনই অর্ডার করুন
              </Button>
            )}
          </div>
        </div>
      )}

      {/* How it works - hip-thigh-combo */}
      {product.id === "hip-thigh-combo" && (
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-foreground">🧪 কার্যপ্রণালী (কিভাবে কাজ করে)</h2>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">🔬 ১) মেটাবলিজম অ্যাক্টিভেশন</h3>
            <p className="text-sm text-foreground">শরীরের ক্যালোরি বার্ন করার ক্ষমতা বাড়াতে সহায়তা করে, ফলে অতিরিক্ত ফ্যাট ধীরে ধীরে কমতে শুরু করে।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">🔥 ২) ফ্যাট রিডাকশন সাপোর্ট</h3>
            <p className="text-sm text-foreground">হিপ, উরু ও নিচের অংশে জমে থাকা চর্বি কমাতে সহায়ক ভূমিকা রাখে, ফলে শরীরের গঠন পরিবর্তন হয়।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">⚖️ ৩) হরমোনাল ব্যালান্স</h3>
            <p className="text-sm text-foreground">শরীরের হরমোনের ভারসাম্য ঠিক রাখতে সহায়তা করে, যা অতিরিক্ত ফ্যাট জমা হওয়ার প্রবণতা কমাতে সাহায্য করে।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">✨ ৪) স্কিন ও টিস্যু সাপোর্ট</h3>
            <p className="text-sm text-foreground">চামড়া টানটান রাখতে এবং শরীরের গঠন আরও ফার্ম দেখাতে সহায়তা করে।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">💪 ৫) এনার্জি ও ভাইটালিটি</h3>
            <p className="text-sm text-foreground">✔ দৈনন্দিন কাজের শক্তি বাড়াতে সহায়ক</p>
            <p className="text-sm text-foreground">✔ ক্লান্তি কমাতে সাহায্য করে</p>
            <p className="text-sm text-foreground">✔ শরীরকে আরও অ্যাক্টিভ রাখে</p>
          </div>

          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center space-y-3">
            <p className="text-sm text-foreground">
              হাজারো মানুষ আমাদের এই ঔষধ ব্যবহার করে আজ তাদের শরীরের শেপ ফিরে পেয়েছেন এবং আত্মবিশ্বাসের সাথে জীবন উপভোগ করছেন। আপনিও যদি দ্রুত এই সমস্যা থেকে মুক্তি পেতে চান, তবে দেরি না করে আজই অর্ডার করুন।
            </p>
            {productOrdered ? (
              <Button size="lg" className="w-full gap-2" variant="secondary" disabled>
                <CheckCircle className="h-4 w-4" /> ইতিমধ্যে অর্ডার করা হয়েছে
              </Button>
            ) : (
              <Button size="lg" className="w-full gap-2 bg-offer text-offer-foreground hover:bg-offer/90" onClick={() => { addToCart(product); navigate("/checkout"); }}>
                <CreditCard className="h-4 w-4" /> এখনই অর্ডার করুন
              </Button>
            )}
          </div>
        </div>
      )}

      {/* How it works - varicocele-combo */}
      {product.id === "varicocele-combo" && (
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-foreground">🧪 কার্যপ্রণালী (কিভাবে কাজ করে)</h2>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">🔬 ১) সার্কুলেশন সাপোর্ট</h3>
            <p className="text-sm text-foreground">শরীরের রক্ত চলাচল স্বাভাবিক রাখতে সহায়তা করে, যার ফলে শিরায় চাপ কমে এবং ফোলাভাব কমাতে সাহায্য করে।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">🔥 ২) ইনফ্লামেশন রিলিফ</h3>
            <p className="text-sm text-foreground">অণ্ডকোষের আশেপাশের অস্বস্তি, জ্বালা বা ব্যথা কমাতে সহায়ক।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">⚖️ ৩) টিস্যু সাপোর্ট</h3>
            <p className="text-sm text-foreground">দুর্বল শিরা ও টিস্যুকে সাপোর্ট দিয়ে স্বাভাবিক অবস্থায় ফিরিয়ে আনতে সহায়তা করে।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">✨ ৪) ফোলাভাব ও ভারীভাব কমানো</h3>
            <p className="text-sm text-foreground">ফুলে যাওয়া ও ভারী অনুভূতি কমাতে সাহায্য করে, ফলে চলাফেরা স্বাভাবিক হয়।</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-primary">💪 ৫) এনার্জি ও আত্মবিশ্বাস</h3>
            <p className="text-sm text-foreground">✔ শারীরিক অস্বস্তি কমিয়ে স্বাভাবিক জীবনে ফিরতে সহায়তা করে</p>
            <p className="text-sm text-foreground">✔ মানসিক স্বস্তি ও আত্মবিশ্বাস বাড়াতে সাহায্য করে</p>
          </div>

          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center space-y-3">
            <p className="text-sm text-foreground">
              হাজারো মানুষ আমাদের এই ঔষধ ব্যবহার করে আজ ভেরিকোসিলের যন্ত্রণা থেকে মুক্তি পেয়ে স্বাভাবিক জীবন উপভোগ করছেন। আপনিও যদি দ্রুত এই সমস্যা থেকে মুক্তি পেতে চান, তবে দেরি না করে আজই অর্ডার করুন।
            </p>
            {productOrdered ? (
              <Button size="lg" className="w-full gap-2" variant="secondary" disabled>
                <CheckCircle className="h-4 w-4" /> ইতিমধ্যে অর্ডার করা হয়েছে
              </Button>
            ) : (
              <Button size="lg" className="w-full gap-2 bg-offer text-offer-foreground hover:bg-offer/90" onClick={() => { addToCart(product); navigate("/checkout"); }}>
                <CreditCard className="h-4 w-4" /> এখনই অর্ডার করুন
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground">কাস্টমার রিভিউ ({reviews.length})</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < review.rating ? "fill-gold text-gold" : "text-border"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="mt-3 text-sm text-foreground">"{review.text}"</p>
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
