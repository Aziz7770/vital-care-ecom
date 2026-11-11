import { afterEach, expect, it } from "vitest";
import { pushPurchase } from "@/lib/dataLayer";
import { products } from "@/data/products";
import { PRODUCT_CODES } from "@/data/productCodes";

type W = Window & { dataLayer?: unknown[]; __TRACK_OK?: boolean };
const w = window as W;

afterEach(() => {
  delete w.dataLayer;
  delete w.__TRACK_OK;
});

it("pushes purchase with order ID, value, BDT and neutral product codes on the owner domain", () => {
  w.__TRACK_OK = true;
  pushPurchase("ORD-TEST1", 1060, [
    { productId: "acid-phos-q", price: 500, quantity: 2 },
  ]);
  expect(w.dataLayer).toEqual([
    { ecommerce: null },
    {
      event: "purchase",
      ecommerce: {
        transaction_id: "ORD-TEST1",
        value: 1060,
        currency: "BDT",
        items: [{ item_id: "BHC-009", item_name: "BHC-009", price: 500, quantity: 2 }],
        content_ids: ["BHC-009"],
        content_type: "product",
        num_items: 2,
      },
    },
  ]);
});

it("never includes real product IDs or names in the push", () => {
  w.__TRACK_OK = true;
  pushPurchase("ORD-TEST3", 900, products.map((p) => ({ productId: p.id, price: p.price, quantity: 1 })));
  const json = JSON.stringify(w.dataLayer);
  for (const p of products) {
    expect(json).not.toContain(p.id);
    expect(json).not.toContain(p.name);
  }
});

it("gives every product a unique neutral code", () => {
  const codes = products.map((p) => PRODUCT_CODES[p.id]);
  expect(codes.every((c) => /^BHC-\d{3}$/.test(c))).toBe(true);
  expect(new Set(codes).size).toBe(products.length);
});

it("pushes nothing outside the owner domain", () => {
  w.__TRACK_OK = false;
  pushPurchase("ORD-TEST2", 500, [{ productId: "china-q", price: 500, quantity: 1 }]);
  expect(w.dataLayer).toBeUndefined();
});
