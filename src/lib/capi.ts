// Helpers for Meta Conversions API deduplication with the browser Pixel.
import { supabase } from "@/integrations/supabase/client";

export const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
};

export const genEventId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export const getCapiContext = () => ({
  event_id: genEventId(),
  event_source_url: typeof window !== "undefined" ? window.location.href : "",
  user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  fbp: getCookie("_fbp"),
  fbc: getCookie("_fbc"),
});

// Fire-and-forget server-side event via the meta-capi-event edge function.
export const sendServerEvent = (payload: {
  eventName: "ViewContent" | "AddToCart" | "InitiateCheckout";
  eventId: string;
  value?: number;
  currency?: string;
  contents?: { id: string; quantity: number; item_price: number }[];
  contentIds?: string[];
  contentName?: string;
  contentCategory?: string;
}) => {
  const ctx = getCapiContext();
  const body = {
    ...payload,
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
