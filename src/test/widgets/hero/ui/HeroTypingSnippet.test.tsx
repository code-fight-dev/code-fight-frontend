"use client";

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockMatchMedia } from "@/test/helpers/matchMedia";
import { HeroTypingSnippet } from "@/widgets/hero/testing";

function mockAnimationFrame() {
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    writable: true,
    value: vi.fn((callback: FrameRequestCallback) => {
      return window.setTimeout(() => {
        callback(performance.now());
      }, 16) as unknown as number;
    }),
  });

  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    writable: true,
    value: vi.fn((id: number) => {
      window.clearTimeout(id);
    }),
  });
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

describe("widgets/hero/ui/HeroTypingSnippet", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAnimationFrame();
    mockMatchMedia(false);
    document.documentElement.removeAttribute("data-motion");
  });

  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute("data-motion");
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("types progressively with a blinking cursor and eventually completes", async () => {
    const { container } = render(
      <pre>
        <HeroTypingSnippet />
      </pre>,
    );

    expect(container).not.toHaveTextContent("frontier = deque([player_state.origin])");
    expect(screen.queryByText("_")).not.toBeInTheDocument();

    await advance(540 + 16 + 28 * 20);

    expect(container).toHaveTextContent("grid = player_st");
    expect(screen.getByText("_")).toBeInTheDocument();
    expect(container).not.toHaveTextContent("best_move = search(frontier, grid)");

    await advance(28 * 30);

    expect(container).toHaveTextContent("frontier =");
    expect(container).not.toHaveTextContent("best_move = search(frontier, grid)");

    await advance(28 * 200);

    expect(container).toHaveTextContent("best_move = search(frontier, grid)");
    expect(screen.queryByText("_")).not.toBeInTheDocument();
  });

  it("reveals full snippet immediately when reduced motion is enabled", async () => {
    document.documentElement.dataset.motion = "disabled";

    const { container } = render(
      <pre>
        <HeroTypingSnippet />
      </pre>,
    );

    await advance(16);

    expect(container).toHaveTextContent("grid = player_state.get_matrix()");
    expect(container).toHaveTextContent("frontier = deque([player_state.origin])");
    expect(container).toHaveTextContent("best_move = search(frontier, grid)");
    expect(screen.queryByText("_")).not.toBeInTheDocument();
  });

  it("cleans up active timeout, animation frame and interval on unmount", async () => {
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const cancelAnimationFrameSpy = vi.spyOn(window, "cancelAnimationFrame");

    const { unmount } = render(
      <pre>
        <HeroTypingSnippet />
      </pre>,
    );

    await advance(540 + 16 + 28);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("cleans up pending timeout without frame or interval when unmounted early", () => {
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const cancelAnimationFrameSpy = vi.spyOn(window, "cancelAnimationFrame");

    const { unmount } = render(
      <pre>
        <HeroTypingSnippet />
      </pre>,
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(cancelAnimationFrameSpy).not.toHaveBeenCalled();
    expect(clearIntervalSpy).not.toHaveBeenCalled();
  });
});
