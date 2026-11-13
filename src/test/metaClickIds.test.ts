import { expect, it } from "vitest";
import { buildMetaFbc, sanitizeMetaFbc, sanitizeMetaFbp } from "../../supabase/functions/_shared/metaSafe";

it("keeps the fbclid exactly as Facebook sent it, including capital letters", () => {
  expect(buildMetaFbc("IwAR2xYz_AbC-123", 1731480000000)).toBe("fb.1.1731480000000.IwAR2xYz_AbC-123");
});

it("passes a valid fbc through unchanged and never lowercases it", () => {
  const fbc = "fb.1.1731480000000.IwAR2xYz_AbC-123";
  expect(sanitizeMetaFbc(fbc)).toBe(fbc);
});

it("drops a malformed fbc instead of rewriting it", () => {
  expect(sanitizeMetaFbc("IwAR2xYz")).toBeUndefined();
  expect(sanitizeMetaFbc("fb.1.123.")).toBeUndefined();
  expect(sanitizeMetaFbc(undefined)).toBeUndefined();
});

it("accepts only a well-formed fbp", () => {
  expect(sanitizeMetaFbp("fb.1.1731480000000.1234567890")).toBe("fb.1.1731480000000.1234567890");
  expect(sanitizeMetaFbp("abc")).toBeUndefined();
});
