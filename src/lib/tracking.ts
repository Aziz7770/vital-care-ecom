// Browser pixel tracking (TikTok only).
// Facebook is NOT tracked in the browser: Meta events go server-side with neutral data only (see capi.ts).

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

export const trackContact = () => {
  window.ttq?.track("Contact", {});
};

export const trackSubmitForm = (formName: string, eventId?: string) => {
  window.ttq?.track("SubmitForm", { description: formName });
};
