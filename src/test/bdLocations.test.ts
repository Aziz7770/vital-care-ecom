import { describe, it, expect } from "vitest";
import { BD_LOCATIONS, BD_DISTRICTS } from "@/data/bdLocations";

describe("district → thana list", () => {
  it("has all 64 districts", () => {
    expect(BD_DISTRICTS.length).toBe(64);
  });
  it("shows Dhaka thanas when Dhaka is picked", () => {
    expect(BD_LOCATIONS["ঢাকা"]).toContain("মিরপুর");
    expect(BD_LOCATIONS["ঢাকা"]).toContain("সাভার");
  });
  it("shows Rajshahi thanas when Rajshahi is picked", () => {
    expect(BD_LOCATIONS["রাজশাহী"]).toContain("বোয়ালিয়া");
    expect(BD_LOCATIONS["রাজশাহী"]).toContain("গোদাগাড়ী");
  });
  it("every district has at least one thana", () => {
    for (const d of BD_DISTRICTS) expect(BD_LOCATIONS[d].length).toBeGreaterThan(0);
  });
});
