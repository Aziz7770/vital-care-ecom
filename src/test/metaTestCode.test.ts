import { describe, it, expect, beforeEach } from "vitest";
import { captureMetaTestCode, getMetaTestCode } from "@/lib/metaTestCode";

describe("Facebook Test Events code", () => {
  beforeEach(() => sessionStorage.clear());
  it("real visitors have no test code", () => {
    captureMetaTestCode("");
    expect(getMetaTestCode()).toBeUndefined();
  });
  it("keeps the code from ?test_event_code= for the tab", () => {
    captureMetaTestCode("?test_event_code=TEST59231");
    expect(getMetaTestCode()).toBe("TEST59231");
  });
  it("ignores invalid codes", () => {
    captureMetaTestCode("?test_event_code=<script>");
    expect(getMetaTestCode()).toBeUndefined();
  });
  it("can be switched off", () => {
    captureMetaTestCode("?test_event_code=TEST59231");
    captureMetaTestCode("?test_event_code=off");
    expect(getMetaTestCode()).toBeUndefined();
  });
});
