import { describe, expect, it } from "vitest";
import { LANDING_ONLY } from "@/config/siteMode";

describe("restored full website", () => {
  it("enables the full website instead of the single landing page", () => {
    expect(LANDING_ONLY).toBe(false);
  });
});