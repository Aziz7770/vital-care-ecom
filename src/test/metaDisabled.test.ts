import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { fbqSafe } from "@/lib/metaPrivacy";

afterEach(() => { delete window.fbq; });

it("sends checkout Purchase to the Pixel with neutral data only", () => {
  window.history.replaceState({}, "", "/checkout");
  const pixel = vi.fn();
  window.fbq = pixel;
  expect(fbqSafe("Purchase", { value: 1450, currency: "BDT", numItems: 2, orderId: "ORD-1" }, "ORD-1")).toBe(true);
  expect(pixel).toHaveBeenCalledWith(
    "track",
    "Purchase",
    { value: 1450, currency: "BDT", num_items: 2, order_id: "ORD-1", content_ids: ["ORD-1"], content_type: "product" },
    { eventID: "ORD-1" },
  );
});

it("sends nothing from a product page whose address names a condition", () => {
  window.history.replaceState({}, "", "/product/gas-acidity-combo");
  const pixel = vi.fn();
  window.fbq = pixel;
  expect(fbqSafe("ViewContent", { value: 500, currency: "BDT" })).toBe(false);
  expect(pixel).not.toHaveBeenCalled();
});

it("loads Pixel 1006266925864656 only on the owner domain, without auto PageView, and no Tag Manager", () => {
  const html = readFileSync("index.html", "utf8");
  const block = html.slice(html.indexOf("<!-- Meta Pixel"), html.indexOf("<!-- End Meta Pixel Code -->"));
  expect(block).toContain("if (window.__TRACK_OK)");
  expect(block).toContain("fbq('init', '1006266925864656')");
  expect(block).toContain("'autoConfig', false");
  expect(block).toContain("disablePushState = true");
  expect(block).not.toMatch(/fbq\(.track.,\s*.PageView/);
  expect(html).not.toContain("googletagmanager");
  expect(html).not.toContain("facebook.com/tr");
});

import { buildMetaUserData, setMetaCustomer, normalizeMetaPhone } from "@/lib/metaPrivacy";

it("normalizes Bangladeshi phone numbers, including Bangla digits", () => {
  expect(normalizeMetaPhone("01354452108")).toBe("8801354452108");
  expect(normalizeMetaPhone("০১৩৫৪৪৫২১০৮")).toBe("8801354452108");
  expect(normalizeMetaPhone("+880 1354-452108")).toBe("8801354452108");
});

it("sends only hashed contact fields to the Pixel for customer matching", async () => {
  const data = await buildMetaUserData({ name: "Rahim Uddin", phone: "01354452108", email: "A@b.com", district: "Gopalganj" });
  expect(Object.keys(data).sort()).toEqual(["country", "ct", "em", "external_id", "fn", "ln", "ph"]);
  for (const v of Object.values(data)) expect(v).toMatch(/^[0-9a-f]{64}$/);
  // sha256("8801354452108")
  const expected = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("8801354452108"))))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
  expect(data.ph).toBe(expected);

  const pixel = vi.fn();
  window.fbq = pixel;
  expect(await setMetaCustomer({ phone: "01354452108" })).toBe(true);
  expect(pixel.mock.calls[0][0]).toBe("init");
  expect(pixel.mock.calls[0][1]).toBe("1006266925864656");
});
