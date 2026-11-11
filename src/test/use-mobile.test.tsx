import { act, renderHook, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "../hooks/use-mobile";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useIsMobile", () => {
  it("updates when the screen crosses the mobile breakpoint and removes its listener", () => {
    let onChange: (() => void) | undefined;
    const removeEventListener = vi.fn();
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      media: query,
      matches: true,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event, listener) => {
        onChange = listener as () => void;
      }),
      removeEventListener,
      dispatchEvent: vi.fn(),
    }));
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(767);
    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(768);
    act(() => onChange?.());
    expect(result.current).toBe(false);
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("change", onChange);
  });
});