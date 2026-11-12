// Privacy guard for everything sent to Meta (Facebook).
// Meta must never receive medicine names, product IDs/slugs, categories,
// descriptions, page paths or any other health-related detail.
// Only neutral commerce fields are allowed.

export const META_NEUTRAL_SOURCE_URL = "https://bismillahhomeochamber.org/";

// Retired app-owned integration: fail closed even if old credentials remain.
export const isLegacyMetaEnabled = (): boolean => false;

// Current browser-only Pixel (loaded from index.html on the owner domain).
export const META_PIXEL_ID = "1748561049573616";
export const isMetaBrowserPixelEnabled = (): boolean => true;

// Conversions API for the current Pixel: server-side Purchase only (from notify-order),
// deduplicated with the browser Purchase via event_id = order ID.
export const META_CAPI_TOKEN_ENV = "META_CAPI_TOKEN_1748561049573616";
export const isMetaServerPurchaseEnabled = (): boolean => true;

/** Same hosts as window.__TRACK_OK in index.html: owner domain + Lovable preview/published links. */
export function isMetaTrackedSite(url?: string | null): boolean {
  if (!url) return false;
  try {
    const h = new URL(url).hostname;
    return /^((www\.)?bismillahhomeochamber\.org|[a-z0-9-]+\.lovable\.app|[a-z0-9-]+\.lovableproject\.com)$/.test(h);
  } catch { return false; }
}

export type MetaSafeInput = {
  value?: number;
  currency?: string;
  numItems?: number;
  orderId?: string;
};

/** Build custom_data containing ONLY neutral fields. */
export function buildMetaSafeCustomData(input: MetaSafeInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof input.value === "number" && Number.isFinite(input.value)) out.value = input.value;
  if (input.currency) out.currency = input.currency;
  if (typeof input.numItems === "number" && input.numItems > 0) out.num_items = input.numItems;
  if (input.orderId) {
    out.order_id = input.orderId;
    out.content_ids = [input.orderId];
    out.content_type = "product";
  }
  return out;
}
