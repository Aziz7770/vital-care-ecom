import { afterEach, expect, it, vi } from "vitest";
import { fbqSafe } from "@/lib/metaPrivacy";

afterEach(() => { delete window.fbq; });

it("does not send Purchase to the removed Facebook pixel even on checkout", () => {
  window.history.replaceState({}, "", "/checkout");
  const pixel = vi.fn();
  window.fbq = pixel;
  expect(fbqSafe("Purchase", { value: 1450, currency: "BDT" }, "removed-pixel-test")).toBe(false);
  expect(pixel).not.toHaveBeenCalled();
});