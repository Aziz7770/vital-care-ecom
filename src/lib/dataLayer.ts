// Google Tag Manager dataLayer pushes.
// Privacy: pushes order ID, total, currency and per-item neutral product codes
// (BHC-xxx), quantity and price only — never product names, real IDs,
// categories or customer details (medicine names reveal health conditions).
import { productCode } from "@/data/productCodes";

type DataLayerWindow = Window & { dataLayer?: unknown[]; __TRACK_OK?: boolean };

export interface PurchaseItem {
  productId: string;
  price: number;
  quantity: number;
}

export function pushPurchase(orderId: string, value: number, items: PurchaseItem[] = [], currency = "BDT") {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  if (!w.__TRACK_OK) return; // owner domain only
  const ecItems = items.map((i) => {
    const code = productCode(i.productId);
    return { item_id: code, item_name: code, price: i.price, quantity: i.quantity };
  });
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ ecommerce: null }); // clear previous ecommerce object (GA4 convention)
  w.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: orderId,
      value,
      currency,
      items: ecItems,
      content_ids: ecItems.map((i) => i.item_id),
      content_type: "product",
      num_items: items.reduce((n, i) => n + i.quantity, 0),
    },
  });
}
