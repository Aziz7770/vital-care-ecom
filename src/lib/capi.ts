// Helpers for Meta Conversions API deduplication with the browser Pixel.
import { supabase } from "@/integrations/supabase/client";
import { isLegacyMetaEnabled } from "../../supabase/functions/_shared/metaSafe";

export const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
};

export const genEventId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

// Remember TikTok ad click id (ttclid) from the landing URL for this visit
export const getTtclid = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ttclid");
    if (fromUrl) sessionStorage.setItem("ttclid", fromUrl);
    return fromUrl || sessionStorage.getItem("ttclid") || undefined;
  } catch {
    return undefined;
  }
};
if (typeof window !== "undefined") getTtclid();

const isOwnerDomain = () =>
  typeof window !== "undefined" && /^(www\.)?bismillahhomeochamber\.org$/.test(window.location.hostname);

// With the browser Pixel removed, keep Meta's first-party browser/click IDs ourselves
// so server events still match ad clicks. Only on the owner domain.
const setCookie = (name: string, value: string) => {
  const days90 = 90 * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days90}; path=/; SameSite=Lax`;
};
const ensureMetaIds = () => {
  if (!isLegacyMetaEnabled()) return;
  if (typeof document === "undefined" || !isOwnerDomain()) return;
  try {
    if (!getCookie("_fbp")) {
      setCookie("_fbp", `fb.1.${Date.now()}.${Math.floor(1e9 + Math.random() * 9e9)}`);
    }
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) {
      const existing = getCookie("_fbc");
      if (!existing || !existing.endsWith(`.${fbclid}`)) setCookie("_fbc", `fb.1.${Date.now()}.${fbclid}`);
    }
  } catch {
    /* ignore */
  }
};
ensureMetaIds();

export const getCapiContext = () => ({
  event_id: genEventId(),
  // Used only server-side to confirm the visit came from the owner domain;
  // it is never forwarded to Meta (Meta receives the neutral site root).
  event_source_url: typeof window !== "undefined" ? window.location.href : "",
  user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  // Set by the browser Pixel; lets Facebook match the server Purchase to the ad click.
  fbp: getCookie("_fbp"),
  fbc: getCookie("_fbc"),
  ttp: getCookie("_ttp"),
  ttclid: getTtclid(),
});

// Fire-and-forget server-side Meta event. Privacy: product IDs, names and
// categories are dropped here — only value, currency and item count are sent.
export const sendServerEvent = (payload: {
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout";
  eventId: string;
  value?: number;
  currency?: string;
  contents?: { id: string; quantity: number; item_price: number }[];
  contentIds?: string[];
  contentName?: string;
  contentCategory?: string;
}) => {
  if (!isLegacyMetaEnabled()) return;
  if (!isOwnerDomain()) return;
  ensureMetaIds();
  const ctx = getCapiContext();
  const numItems = payload.contents?.reduce((sum, c) => sum + c.quantity, 0);
  const body = {
    eventName: payload.eventName,
    eventId: payload.eventId,
    value: payload.value,
    currency: payload.currency,
    contents: numItems ? [{ id: "item", quantity: numItems, item_price: 0 }] : undefined,
    eventSourceUrl: ctx.event_source_url,
    userAgent: ctx.user_agent,
    fbp: ctx.fbp,
    fbc: ctx.fbc,
  };
  try {
    supabase.functions.invoke("meta-capi-event", { body }).catch(() => {});
  } catch {
    /* swallow */
  }
};
