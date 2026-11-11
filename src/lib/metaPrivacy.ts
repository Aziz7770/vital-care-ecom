// Browser Facebook Pixel privacy guard.
// The browser Pixel always reports the current page address to Meta, so it may only
// fire on pages whose address reveals nothing about medicines or health.
// Product/offer pages, consultation and admin pages are server-side only.

import { isMetaBrowserPixelEnabled } from "../../supabase/functions/_shared/metaSafe";

export const META_BROWSER_SAFE_PATHS = [
  "/",
  "/cart",
  "/checkout",
  "/products",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/return-policy",
];

export const isMetaBrowserSafePath = (pathname: string): boolean => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return META_BROWSER_SAFE_PATHS.includes(clean);
};

export type MetaSafeParams = {
  value?: number;
  currency?: string;
  numItems?: number;
  orderId?: string;
};

/** Only neutral fields — same shape the server sends (supabase/functions/_shared/metaSafe.ts). */
export const buildMetaSafeParams = (p: MetaSafeParams): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (typeof p.value === "number" && Number.isFinite(p.value)) out.value = p.value;
  if (p.currency) out.currency = p.currency;
  if (typeof p.numItems === "number" && p.numItems > 0) out.num_items = p.numItems;
  if (p.orderId) {
    out.order_id = p.orderId;
    out.content_ids = [p.orderId];
    out.content_type = "product";
  }
  return out;
};

/** Fire a browser Pixel event only on safe pages, with neutral params only. */
export const fbqSafe = (event: string, params: MetaSafeParams = {}, eventId?: string): boolean => {
  if (!isMetaBrowserPixelEnabled()) return false;
  if (typeof window === "undefined" || !window.fbq) return false;
  if (!isMetaBrowserSafePath(window.location.pathname)) return false;
  window.fbq("track", event, buildMetaSafeParams(params), eventId ? { eventID: eventId } : undefined);
  return true;
};
