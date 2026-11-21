import { describe, it, expect } from "vitest";
import { isOrderLocked, lockOrders } from "@/lib/orderLock";

const memStorage = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe("one order per browser", () => {
  it("allows ordering before any order is placed", () => {
    expect(isOrderLocked(memStorage())).toBe(false);
  });
  it("blocks a second order after a successful order", () => {
    const s = memStorage();
    lockOrders(s);
    expect(isOrderLocked(s)).toBe(true);
  });
});
