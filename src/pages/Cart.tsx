import { Link } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import SEO from "@/components/SEO";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold text-foreground">আপনার কার্ট খালি</h2>
        <p className="mt-1 text-sm text-muted-foreground">কিছু ঔষধ যোগ করুন</p>
        <Button asChild className="mt-4"><Link to="/products">ঔষধ দেখুন</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <SEO title="শপিং কার্ট" description="আপনার কার্টে থাকা ঔষধসমূহ দেখুন এবং অর্ডার করুন।" noindex />
      <h1 className="text-2xl font-bold text-foreground">শপিং কার্ট</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
              <img src={item.product.image} alt={item.product.name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">{item.product.name}</h3>
                <p className="text-xs text-muted-foreground">{item.product.nameEn}</p>
                <p className="mt-1 font-bold text-primary">৳{item.product.price}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">পরিমাণ: ১</span>
                  <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-border bg-card p-6 h-fit">
          <h3 className="font-semibold text-foreground">অর্ডার সারাংশ</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">সাবটোটাল</span><span className="text-foreground">৳{totalPrice}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ডেলিভারি চার্জ</span><span className="text-foreground">{totalPrice >= 500 ? "ফ্রি" : "৳60"}</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span className="text-foreground">মোট</span>
              <span className="text-primary">৳{totalPrice + (totalPrice >= 500 ? 0 : 60)}</span>
            </div>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link to="/checkout">চেকআউট করুন</Link>
          </Button>
          {totalPrice < 500 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">৳{500 - totalPrice} আরও কিনলে ফ্রি ডেলিভারি!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
