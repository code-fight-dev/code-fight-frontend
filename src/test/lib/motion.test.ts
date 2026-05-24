import { afterEach, describe, expect, it, vi } from "vitest";

import { shouldReduceMotion } from "@/shared/lib/motion";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("shouldReduceMotion", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns false when window is not available", () => {
    vi.stubGlobal("window", undefined);

    expect(shouldReduceMotion()).toBe(false);
  });

  it("returns true when motion is disabled through document dataset", () => {
    mockMatchMedia(false);

    document.documentElement.dataset.motion = "disabled";

    expect(shouldReduceMotion()).toBe(true);
  });

  it("returns true when prefers-reduced-motion media query matches", () => {
    mockMatchMedia(true);

    expect(shouldReduceMotion()).toBe(true);
  });

  it("returns false when motion is not disabled and media query does not match", () => {
    mockMatchMedia(false);

    expect(shouldReduceMotion()).toBe(false);
  });

  it("uses the prefers-reduced-motion media query", () => {
    mockMatchMedia(false);

    shouldReduceMotion();

    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
});
