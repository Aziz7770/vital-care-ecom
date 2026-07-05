import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { trackInitiateCheckout, trackCompletePayment } from "@/lib/tracking";

const OWNER_WHATSAPP = "8801767678562";

const Checkout = () => {
  const { items, totalPrice, clearCart, markProductsAsOrdered } = useCart();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const orderItemsRef = useRef(items);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (items.length > 0) {
      trackInitiateCheckout(
        items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
        totalPrice
      );
    }
  }, []);

  const deliveryCharge = totalPrice >= 500 ? 0 : 60;

  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const note = formData.get("note") as string;

    // Build WhatsApp message with order details
    const currentItems = orderItemsRef.current;
    const currentTotal = currentItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const currentDelivery = currentTotal >= 500 ? 0 : 60;

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Save to database
    const { error } = await supabase.from("orders").insert({
      order_id: orderId,
      customer_name: name,
      phone,
      address,
      note: note || "",
      items: currentItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal: currentTotal,
      delivery_charge: currentDelivery,
      total: currentTotal + currentDelivery,
    });

    if (error) {
      console.error("Order save error:", error);
      toast.error("অর্ডার সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setSubmitting(false);
      return;
    }

    // Send notifications via edge function
    try {
      const { data: notifyData } = await supabase.functions.invoke('notify-order', {
        body: {
          orderId,
          customerName: name,
          phone,
          address,
          note: note || "",
          items: currentItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
          subtotal: currentTotal,
          deliveryCharge: currentDelivery,
          total: currentTotal + currentDelivery,
        },
      });
      // WhatsApp redirect removed — customer can use the floating WhatsApp button instead
    } catch (notifyErr) {
      console.error("Notification error:", notifyErr);
    }

    trackCompletePayment(
      orderId,
      currentItems.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
      currentTotal + currentDelivery
    );

    markProductsAsOrdered(currentItems.map((i) => i.product.id));
    setSubmitted(true);
    clearCart();
    toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
  };

  // Keep items ref updated
  useEffect(() => {
    if (items.length > 0) {
      orderItemsRef.current = items;
    }
  }, [items]);

  if (submitted) {
    return (
      <div className="container py-20 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-primary" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">অর্ডার সফল!</h2>
        <p className="mt-2 text-sm text-muted-foreground">আপনার অর্ডার সফলভাবে গৃহীত হয়েছে। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।</p>
        <Button onClick={() => navigate("/")} className="mt-6">হোমপেজে যান</Button>
      </div>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="container py-8">
      <SEO title="চেকআউট" description="আপনার অর্ডার কনফার্ম করুন।" noindex />
      <h1 className="text-2xl font-bold text-foreground">চেকআউট</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">ডেলিভারি তথ্য</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="name">আপনার নাম *</Label><Input id="name" name="name" required placeholder="পূর্ণ নাম" /></div>
              <div><Label htmlFor="phone">মোবাইল নম্বর *</Label><Input id="phone" name="phone" required placeholder="০১XXXXXXXXX" type="tel" /></div>
            </div>
            <div><Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label><Textarea id="address" name="address" required placeholder="বাসা/ফ্ল্যাট নং, রোড, এলাকা, থানা, জেলা" /></div>
            <div><Label htmlFor="note">বিশেষ নোট (ঐচ্ছিক)</Label><Input id="note" name="note" placeholder="যেকোনো বিশেষ নির্দেশনা" /></div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">পেমেন্ট পদ্ধতি</h3>
            <div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">ক্যাশ অন ডেলিভারি</p>
                <p className="text-xs text-muted-foreground">পণ্য হাতে পেয়ে টাকা দিন</p>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "প্রসেস হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
          </Button>
        </form>

        {/* Order summary */}
        <div className="rounded-xl border border-border bg-card p-6 h-fit">
          <h3 className="font-semibold text-foreground">আপনার অর্ডার</h3>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 text-sm">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-10 w-10 rounded-md object-cover border border-border flex-shrink-0"
                />
                <span className="flex-1 text-foreground line-clamp-2">{item.product.name} × {item.quantity}</span>
                <span className="text-foreground font-medium flex-shrink-0">৳{item.product.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">সাবটোটাল</span><span>৳{totalPrice}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ডেলিভারি</span><span>{deliveryCharge === 0 ? "ফ্রি" : `৳${deliveryCharge}`}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2">
              <span>মোট</span><span className="text-primary">৳{totalPrice + deliveryCharge}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
