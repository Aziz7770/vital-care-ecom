import { describe, expect, it } from "vitest";
import { buildMetaSafeParams, isMetaBrowserSafePath } from "@/lib/metaPrivacy";

describe("browser Facebook Pixel privacy", () => {
  it("fires on checkout and home", () => {
    expect(isMetaBrowserSafePath("/checkout")).toBe(true);
    expect(isMetaBrowserSafePath("/")).toBe(true);
  });

  it("never fires on product/offer or consultation pages", () => {
    expect(isMetaBrowserSafePath("/gynecomastia-combo-offer")).toBe(false);
    expect(isMetaBrowserSafePath("/product/gynecomastia-combo-offer")).toBe(false);
    expect(isMetaBrowserSafePath("/consultation")).toBe(false);
  });

  it("Purchase params carry only order id, value, currency, item count", () => {
    const params = buildMetaSafeParams({
      value: 1450, currency: "BDT", numItems: 1, orderId: "BHC-1",
      // @ts-expect-error product details must be dropped
      content_name: "Gynecomastia",
    });
    expect(params).toEqual({
      value: 1450, currency: "BDT", num_items: 1,
      order_id: "BHC-1", content_ids: ["BHC-1"], content_type: "product",
    });
  });
});
