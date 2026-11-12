// Browser pixel tracking (TikTok + Facebook).
// Facebook browser events go through fbqSafe: neutral data only, and only on pages
// whose address reveals no health detail. Server events (capi.ts) cover every page.
import { fbqSafe } from "@/lib/metaPrivacy";

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>, opts?: Record<string, unknown>) => void;
      page: () => void;
    };
    fbq?: (...args: unknown[]) => void;
  }
}

export const trackViewContent = (
  product: { id: string; name: string; price: number; category?: string },
  eventId?: string,
) => {
  window.ttq?.track("ViewContent", {
    content_id: product.id,
    content_name: product.name,
    content_type: "product",
    content_category: product.category || "",
    value: product.price,
    currency: "BDT",
  });
  fbqSafe("ViewContent", { value: product.price, currency: "BDT", numItems: 1 }, eventId);
};

export const trackAddToCart = (
  product: { id: string; name: string; price: number; category?: string },
  quantity = 1,
  eventId?: string,
) => {
  window.ttq?.track("AddToCart", {
    content_id: product.id,
    content_name: product.name,
    content_type: "product",
    quantity,
    value: product.price * quantity,
    currency: "BDT",
  });
  fbqSafe("AddToCart", { value: product.price * quantity, currency: "BDT", numItems: quantity }, eventId);
};

export const trackInitiateCheckout = (
  items: { id: string; name: string; price: number; quantity: number }[],
  total: number,
  eventId?: string,
) => {
  window.ttq?.track("InitiateCheckout", {
    contents: items.map((i) => ({ content_id: i.id, content_name: i.name, quantity: i.quantity, price: i.price })),
    value: total,
    currency: "BDT",
  });
  fbqSafe("InitiateCheckout", { value: total, currency: "BDT", numItems: items.reduce((s, i) => s + i.quantity, 0) }, eventId);
};

export const trackCompletePayment = (
  orderId: string,
  items: { id: string; name: string; price: number; quantity: number }[],
  total: number,
  eventId?: string,
) => {
  window.ttq?.track("CompletePayment", {
    contents: items.map((i) => ({ content_id: i.id, content_name: i.name, quantity: i.quantity, price: i.price })),
    value: total,
    currency: "BDT",
    order_id: orderId,
  }, eventId ? { event_id: eventId } : undefined);
};

/**
 * Facebook Purchase is sent once: by the server (Conversions API) first.
 * The browser Pixel sends it only when the server copy was not accepted
 * (same event ID as a safety net, so Facebook still never counts it twice).
 */
export const metaServerPurchaseAccepted = (res: unknown): boolean => {
  const capi = (res as { results?: { capi?: { ok?: boolean; data?: { events_received?: number } } } } | null)?.results?.capi;
  return !!capi?.ok && (capi.data?.events_received ?? 0) >= 1;
};

export const trackMetaPurchaseFallback = (orderId: string, total: number, numItems: number, eventId: string) =>
  fbqSafe("Purchase", { value: total, currency: "BDT", numItems, orderId }, eventId);

export const trackContact = () => {
  window.ttq?.track("Contact", {});
  fbqSafe("Contact");
};

export const trackSubmitForm = (formName: string, eventId?: string) => {
  window.ttq?.track("SubmitForm", { description: formName });
  fbqSafe("Lead", {}, eventId);
};
