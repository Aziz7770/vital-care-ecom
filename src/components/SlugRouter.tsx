import { useParams } from "react-router-dom";
import { products } from "@/data/products";
import ProductLanding from "@/pages/ProductLanding";
import ProductDetail from "@/pages/ProductDetail";
import NotFound from "@/pages/NotFound";

// Products with dedicated landing pages
const landingSlugs = ["gynecomastia-combo"];

const SlugRouter = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);

  if (product) {
    if (landingSlugs.includes(product.slug)) {
      return <ProductLanding />;
    }
    return <ProductDetail />;
  }

  return <NotFound />;
};

export default SlugRouter;
