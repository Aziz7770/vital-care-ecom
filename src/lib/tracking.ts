// Pixel tracking utility for TikTok (and Facebook when added)

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
    fbq?: (...args: unknown[]) => void;
  }
}

// TikTok Pixel Events
export const trackViewContent = (product: { id: string; name: string; price: number; category?: string }) => {
  window.ttq?.track("ViewContent", {
    content_id: product.id,
    content_name: product.name,
    content_type: "product",
    content_category: product.category || "",
    value: product.price,
    currency: "BDT",
  });
  window.fbq?.("track", "ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    content_category: product.category || "",
    value: product.price,
    currency: "BDT",
  });
};

export const trackAddToCart = (product: { id: string; name: string; price: number; category?: string }, quantity = 1) => {
  window.ttq?.track("AddToCart", {
    content_id: product.id,
    content_name: product.name,
    content_type: "product",
    quantity,
    value: product.price * quantity,
    currency: "BDT",
  });
  window.fbq?.("track", "AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price * quantity,
    currency: "BDT",
  });
};

export const trackInitiateCheckout = (items: { id: string; name: string; price: number; quantity: number }[], total: number) => {
  window.ttq?.track("InitiateCheckout", {
    contents: items.map((i) => ({ content_id: i.id, content_name: i.name, quantity: i.quantity, price: i.price })),
    value: total,
    currency: "BDT",
  });
  window.fbq?.("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    value: total,
    currency: "BDT",
    num_items: items.length,
  });
};

export const trackCompletePayment = (orderId: string, items: { id: string; name: string; price: number; quantity: number }[], total: number) => {
  window.ttq?.track("CompletePayment", {
    contents: items.map((i) => ({ content_id: i.id, content_name: i.name, quantity: i.quantity, price: i.price })),
    value: total,
    currency: "BDT",
    order_id: orderId,
  });
  window.fbq?.("track", "Purchase", {
    content_ids: items.map((i) => i.id),
    value: total,
    currency: "BDT",
    num_items: items.length,
  });
};

export const trackContact = () => {
  window.ttq?.track("Contact", {});
  window.fbq?.("track", "Contact");
};

export const trackSubmitForm = (formName: string) => {
  window.ttq?.track("SubmitForm", { description: formName });
  window.fbq?.("track", "Lead", { content_name: formName });
};
