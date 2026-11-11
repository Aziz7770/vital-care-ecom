import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildMetaSafeCustomData, META_NEUTRAL_SOURCE_URL } from "./metaSafe.ts";

Deno.test("Purchase custom_data has only order id, value, currency, item count", () => {
  const data = buildMetaSafeCustomData({ value: 1450, currency: "BDT", numItems: 2, orderId: "BHC-123" });
  assertEquals(data, {
    value: 1450,
    currency: "BDT",
    num_items: 2,
    order_id: "BHC-123",
    content_ids: ["BHC-123"],
    content_type: "product",
  });
});

Deno.test("product names/categories passed in are never forwarded", () => {
  // deno-lint-ignore no-explicit-any
  const data = buildMetaSafeCustomData({ value: 990, currency: "BDT", content_name: "Gynecomastia", content_category: "medicine" } as any);
  assertEquals(Object.keys(data).sort(), ["currency", "value"]);
});

Deno.test("neutral source URL is the site root only", () => {
  assertEquals(META_NEUTRAL_SOURCE_URL, "https://bismillahhomeochamber.org/");
});
