import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HEADER_NAV, useHeaderState } from "@/widgets/header/testing";

const headerModelMocks = vi.hoisted(() => ({
  shouldReduceMotion: vi.fn(),
}));

vi.mock("@/shared/lib/motion", () => ({
  shouldReduceMotion: headerModelMocks.shouldReduceMotion,
}));

type RafCallback = FrameRequestCallback;

const rafCallbacks = new Map<number, RafCallback>();
let nextRafId = 1;

function installRafMock() {
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    writable: true,
    value: vi.fn((callback: FrameRequestCallback) => {
      const id = nextRafId;
      nextRafId += 1;
      rafCallbacks.set(id, callback);
      return id;
    }),
  });

  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    writable: true,
    value: vi.fn((id: number) => {
      rafCallbacks.delete(id);
    }),
  });
}

function runRaf(id: number) {
  const callback = rafCallbacks.get(id);
  if (!callback) {
    throw new Error(`Missing RAF callback for id ${id}`);
  }
  rafCallbacks.delete(id);

  act(() => {
    callback(performance.now());
  });
}

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    writable: true,
    value,
  });
}

describe("widgets/header/model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installRafMock();
    rafCallbacks.clear();
    nextRafId = 1;
    setScrollY(0);
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });
    headerModelMocks.shouldReduceMotion.mockReturnValue(false);
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });

  it("defines stable header navigation links", () => {
    expect(HEADER_NAV).toEqual([
      { label: "Arena", href: "/arena" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Challenges", href: "/challenges" },
      { label: "Documentation", href: "/docs" },
    ]);
  });

  it("syncs readiness and scroll-driven elevated styles when motion is enabled", () => {
    setScrollY(160);

    const { result } = renderHook(() => useHeaderState());

    expect(result.current.isReady).toBe(false);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(result.current.surfaceStyles.shimmerStyle.transform).toBe(
      "translateX(-120px) rotate(8deg)",
    );

    runRaf(1);

    expect(result.current.isReady).toBe(true);
    expect(result.current.isElevated).toBe(true);
    expect(result.current.isMenuOpen).toBe(false);
    expect(result.current.surfaceStyles.leftGlowStyle.transform).toContain("translate(");
    expect(result.current.surfaceStyles.leftGlowStyle.transform).not.toContain(
      "translate(0px, 0px)",
    );
    expect(result.current.surfaceStyles.leftGlowStyle.opacity).toBeCloseTo(0.8);
    expect(result.current.surfaceStyles.rightGlowStyle.transform).toContain("scale(");
    expect(result.current.surfaceStyles.rightGlowStyle.opacity).toBeCloseTo(0.77);
    expect(result.current.surfaceStyles.shimmerStyle.transform).toContain("rotate(8deg)");
    expect(result.current.surfaceStyles.shimmerStyle.opacity).toBeCloseTo(0.15);
    expect(result.current.surfaceStyles.trailStyle.transform).not.toBe("translateX(0px)");
  });

  it("keeps zero progress styles under reduced motion and ignores redundant scroll RAF", () => {
    headerModelMocks.shouldReduceMotion.mockReturnValue(true);
    setScrollY(320);

    const { result } = renderHook(() => useHeaderState());

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    runRaf(1);

    expect(result.current.isReady).toBe(true);
    expect(result.current.isElevated).toBe(true);
    expect(result.current.surfaceStyles.leftGlowStyle.transform).toBe(
      "translate(0px, 0px) scale(1)",
    );
    expect(result.current.surfaceStyles.rightGlowStyle.transform).toBe(
      "translate(0px, 0px) scale(1)",
    );
    expect(result.current.surfaceStyles.shimmerStyle.transform).toBe(
      "translateX(-120px) rotate(8deg)",
    );
    expect(result.current.surfaceStyles.trailStyle.transform).toBe("translateX(0px)");
  });

  it("schedules at most one pending scroll frame and updates progress after flush", () => {
    setScrollY(0);
    const { result } = renderHook(() => useHeaderState());

    runRaf(1);
    expect(result.current.isElevated).toBe(false);

    setScrollY(320);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
    });
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);

    runRaf(2);
    expect(result.current.isElevated).toBe(true);
    expect(result.current.surfaceStyles.leftGlowStyle.transform).not.toContain(
      "translate(0px, 0px)",
    );
    expect(result.current.surfaceStyles.trailStyle.transform).not.toBe("translateX(0px)");
  });

  it("resets non-zero scroll progress to zero when reduced motion toggles on", () => {
    headerModelMocks.shouldReduceMotion.mockReturnValue(false);
    setScrollY(320);

    const { result } = renderHook(() => useHeaderState());
    runRaf(1);

    expect(result.current.surfaceStyles.leftGlowStyle.transform).not.toContain(
      "translate(0px, 0px)",
    );

    headerModelMocks.shouldReduceMotion.mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    runRaf(2);

    expect(result.current.surfaceStyles.leftGlowStyle.transform).toBe(
      "translate(0px, 0px) scale(1)",
    );
    expect(result.current.surfaceStyles.shimmerStyle.transform).toBe(
      "translateX(-120px) rotate(8deg)",
    );
  });

  it("handles menu open/close APIs, escape key and resize breakpoint cleanup", () => {
    const { result } = renderHook(() => useHeaderState());
    runRaf(1);

    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "scroll";

    act(() => {
      result.current.toggleMenu();
    });

    expect(result.current.isMenuOpen).toBe(true);
    expect(result.current.isElevated).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });
    expect(result.current.isMenuOpen).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isMenuOpen).toBe(false);
    expect(document.documentElement.style.overflow).toBe("auto");
    expect(document.body.style.overflow).toBe("scroll");

    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isMenuOpen).toBe(true);

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 900,
    });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.isMenuOpen).toBe(true);

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1024,
    });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.isMenuOpen).toBe(false);

    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isMenuOpen).toBe(true);

    act(() => {
      result.current.closeMenu();
    });
    expect(result.current.isMenuOpen).toBe(false);
  });

  it("cancels pending frame on unmount and detaches listeners", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useHeaderState());

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("does not cancel frame on unmount when no frame is pending", () => {
    const { unmount } = renderHook(() => useHeaderState());
    runRaf(1);

    unmount();

    expect(window.cancelAnimationFrame).not.toHaveBeenCalled();
  });
});
