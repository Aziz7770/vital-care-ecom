import { Link, useNavigate } from "react-router-dom";
import { Star, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Product } from "@/data/products";
import { toast } from "sonner";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, isOrdered } = useCart();
  const navigate = useNavigate();
  const productOrdered = isOrdered(product.id);

  const handleOrder = () => {
    if (productOrdered) {
      toast.info("এই পণ্যটি ইতিমধ্যে অর্ডার করা হয়েছে।");
      return;
    }
    addToCart(product);
    toast.success("অর্ডার প্রস্তুত! আপনার তথ্য দিন।");
    navigate("/checkout");
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:shadow-card-hover">
      {discount > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-offer px-2 py-0.5 text-[10px] font-bold text-offer-foreground">
          {discount}% ছাড়
        </span>
      )}
      <Link to={`/${product.slug}`}>
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/${product.slug}`}>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1 hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{product.nameEn}</p>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3 w-3 fill-gold text-gold" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-primary">৳{product.price}</span>
            {product.originalPrice && (
              <span className="ml-1 text-xs text-muted-foreground line-through">
                ৳{product.originalPrice}
              </span>
            )}
          </div>
          {productOrdered ? (
            <Button size="sm" className="h-8 gap-1 text-xs" variant="secondary" disabled>
              <CheckCircle className="h-3 w-3" /> অর্ডার হয়েছে
            </Button>
          ) : (
            <Button size="sm" className="h-8 gap-1 text-xs" onClick={handleOrder}>
              <CreditCard className="h-3 w-3" /> অর্ডার
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
