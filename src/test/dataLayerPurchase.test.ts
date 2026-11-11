import { afterEach, expect, it } from "vitest";
import { pushPurchase } from "@/lib/dataLayer";

type W = Window & { dataLayer?: unknown[]; __TRACK_OK?: boolean };
const w = window as W;

afterEach(() => {
  delete w.dataLayer;
  delete w.__TRACK_OK;
});

it("pushes a purchase event with only order ID, value and currency on the owner domain", () => {
  w.__TRACK_OK = true;
  pushPurchase("ORD-TEST1", 1060);
  expect(w.dataLayer).toEqual([
    { ecommerce: null },
    { event: "purchase", ecommerce: { transaction_id: "ORD-TEST1", value: 1060, currency: "BDT" } },
  ]);
});

it("pushes nothing outside the owner domain", () => {
  w.__TRACK_OK = false;
  pushPurchase("ORD-TEST2", 500);
  expect(w.dataLayer).toBeUndefined();
});
