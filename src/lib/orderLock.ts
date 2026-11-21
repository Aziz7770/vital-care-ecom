// One order per browser: after a successful order, this browser cannot place another.
export const ORDER_LOCK_KEY = "homeopathy_order_locked";
export const ORDER_LOCKED_MESSAGE = "এই ব্রাউজার থেকে ইতিমধ্যে একটি অর্ডার করা হয়েছে।";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const defaultStorage = (): StorageLike | null => {
  try { return typeof window !== "undefined" ? window.localStorage : null; } catch { return null; }
};

export function isOrderLocked(storage: StorageLike | null = defaultStorage()): boolean {
  try { return storage?.getItem(ORDER_LOCK_KEY) === "1"; } catch { return false; }
}

export function lockOrders(storage: StorageLike | null = defaultStorage()): void {
  try { storage?.setItem(ORDER_LOCK_KEY, "1"); } catch { /* ignore */ }
}
