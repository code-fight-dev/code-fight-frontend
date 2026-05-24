import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Toast } from "@/shared/ui/Toast";

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

function mockAnimationFrame() {
  Object.defineProperty(window, "requestAnimationFrame", {
    writable: true,
    value: vi.fn((callback: FrameRequestCallback) => {
      return window.setTimeout(() => {
        callback(performance.now());
      }, 16) as unknown as number;
    }),
  });

  Object.defineProperty(window, "cancelAnimationFrame", {
    writable: true,
    value: vi.fn((id: number) => {
      window.clearTimeout(id);
    }),
  });
}

async function advanceAnimationFrame() {
  await act(async () => {
    vi.advanceTimersByTime(16);
  });
}

async function advanceTime(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

function getToastMessageBox(message: string) {
  const messageNode = screen.getByText(message);
  const toastBox = messageNode.closest("div");

  if (!toastBox) {
    throw new Error("Toast message box was not found");
  }

  return toastBox;
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    mockAnimationFrame();
    document.documentElement.removeAttribute("data-motion");
  });

  afterEach(() => {
    cleanup();

    document.documentElement.removeAttribute("data-motion");

    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders nothing when message is null", () => {
    const { container } = render(<Toast message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders provided message", () => {
    render(<Toast message="Profile saved" />);

    expect(screen.getByText("Profile saved")).toBeInTheDocument();
  });

  it("uses polite aria-live region", () => {
    render(<Toast message="Profile saved" />);

    const liveRegion = screen.getByText("Profile saved").parentElement?.parentElement;

    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("starts hidden before animation frame finishes", () => {
    render(<Toast message="Profile saved" />);

    expect(getToastMessageBox("Profile saved")).toHaveClass("opacity-0");
  });

  it("becomes visible after enter animation frames", async () => {
    render(<Toast message="Profile saved" />);

    await advanceAnimationFrame();
    await advanceAnimationFrame();

    expect(getToastMessageBox("Profile saved")).toHaveClass("opacity-100");
    expect(getToastMessageBox("Profile saved")).toHaveClass("transform-none");
  });

  it("uses one animation frame when reduced motion is enabled", async () => {
    document.documentElement.dataset.motion = "disabled";

    render(<Toast message="Profile saved" />);

    await advanceAnimationFrame();

    expect(getToastMessageBox("Profile saved")).toHaveClass("opacity-100");
    expect(getToastMessageBox("Profile saved")).toHaveClass("transform-none");
  });

  it("keeps previous message while hiding after message becomes null", async () => {
    const { rerender } = render(<Toast message="Profile saved" />);

    await advanceAnimationFrame();
    await advanceAnimationFrame();

    rerender(<Toast message={null} />);

    expect(screen.getByText("Profile saved")).toBeInTheDocument();

    await advanceAnimationFrame();

    expect(getToastMessageBox("Profile saved")).toHaveClass("opacity-0");
  });

  it("removes rendered message after exit timeout", async () => {
    const { rerender } = render(<Toast message="Profile saved" />);

    await advanceAnimationFrame();
    await advanceAnimationFrame();

    rerender(<Toast message={null} />);

    await advanceAnimationFrame();
    await advanceTime(260);

    expect(screen.queryByText("Profile saved")).not.toBeInTheDocument();
  });

  it("renders updated message", async () => {
    const { rerender } = render(<Toast message="Profile saved" />);

    await advanceAnimationFrame();
    await advanceAnimationFrame();

    rerender(<Toast message="Settings saved" />);

    await advanceAnimationFrame();
    await advanceAnimationFrame();

    expect(screen.queryByText("Profile saved")).not.toBeInTheDocument();
    expect(screen.getByText("Settings saved")).toBeInTheDocument();
  });
});
