// Privacy guard for everything sent to Meta (Facebook).
// Meta must never receive medicine names, product IDs/slugs, categories,
// descriptions, page paths or any other health-related detail.
// Only neutral commerce fields are allowed.

export const META_NEUTRAL_SOURCE_URL = "https://bismillahhomeochamber.org/";

// Retired app-owned integration: fail closed even if old credentials remain.
export const isLegacyMetaEnabled = (): boolean => false;

// Current browser-only Pixel (loaded from index.html on the owner domain).
// Server events stay off until a Conversions API token for this Pixel is added.
export const META_PIXEL_ID = "1006266925864656";
export const isMetaBrowserPixelEnabled = (): boolean => true;

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
