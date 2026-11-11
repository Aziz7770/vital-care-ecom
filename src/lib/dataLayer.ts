// Google Tag Manager dataLayer pushes.
// Privacy: only order ID, total and currency are pushed — never product names,
// IDs, categories or customer details (medicine names reveal health conditions).

type DataLayerWindow = Window & { dataLayer?: unknown[]; __TRACK_OK?: boolean };

export function pushPurchase(orderId: string, value: number, currency = "BDT") {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  if (!w.__TRACK_OK) return; // owner domain only
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ ecommerce: null }); // clear previous ecommerce object (GA4 convention)
  w.dataLayer.push({
    event: "purchase",
    ecommerce: { transaction_id: orderId, value, currency },
  });
}
