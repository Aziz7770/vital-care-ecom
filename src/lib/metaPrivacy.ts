// Browser Facebook Pixel privacy guard.
// The browser Pixel always reports the current page address to Meta, so it may only
// fire on pages whose address reveals nothing about medicines or health.
// Product/offer pages, consultation and admin pages are server-side only.

import { isMetaBrowserPixelEnabled, isMetaTrackedSite, META_PIXEL_ID } from "../../supabase/functions/_shared/metaSafe";

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
  if (!isMetaTrackedSite(window.location.href)) return false;
  if (!isMetaBrowserSafePath(window.location.pathname)) return false;
  window.fbq("track", event, buildMetaSafeParams(params), eventId ? { eventID: eventId } : undefined);
  return true;
};

// ---- Customer matching (Advanced Matching) ----
// Owner-approved: name, phone, email and district/city may go to Meta, SHA-256
// hashed in the browser. Never add medicine, product or health fields here.
export type MetaCustomer = { name?: string; phone?: string; email?: string; district?: string };

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

export const normalizeMetaPhone = (p: string): string => {
  const digits = toAsciiDigits(p || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return "88" + digits;
  return digits;
};

const sha256 = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

/** Hashed Advanced Matching fields — contact details only. */
export const buildMetaUserData = async (c: MetaCustomer): Promise<Record<string, string>> => {
  const out: Record<string, string> = {};
  const ph = normalizeMetaPhone(c.phone || "");
  if (ph) {
    out.ph = await sha256(ph);
    out.external_id = out.ph;
  }
  if (c.email?.trim()) out.em = await sha256(c.email);
  const parts = (c.name || "").trim().split(/\s+/).filter(Boolean);
  if (parts[0]) out.fn = await sha256(parts[0]);
  if (parts.length > 1) out.ln = await sha256(parts.slice(1).join(" "));
  if (c.district?.trim()) out.ct = await sha256(c.district.replace(/\s+/g, ""));
  out.country = await sha256("bd");
  return out;
};

/** Attach the buyer's hashed contact details to the Pixel before Purchase. */
export const setMetaCustomer = async (c: MetaCustomer): Promise<boolean> => {
  if (!isMetaBrowserPixelEnabled()) return false;
  if (typeof window === "undefined" || !window.fbq) return false;
  if (!isMetaTrackedSite(window.location.href)) return false;
  try {
    window.fbq("init", META_PIXEL_ID, await buildMetaUserData(c));
    return true;
  } catch {
    return false;
  }
};
