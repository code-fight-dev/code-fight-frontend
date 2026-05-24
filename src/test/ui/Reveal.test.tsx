import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "@/shared/ui/Reveal";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly callback: IntersectionObserverCallback;
  readonly options?: IntersectionObserverInit;

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.options = options;

    MockIntersectionObserver.instances.push(this);
  }

  trigger(entry: Partial<IntersectionObserverEntry>) {
    this.callback(
      [entry as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

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
      callback(performance.now());

      return 1;
    }),
  });

  Object.defineProperty(window, "cancelAnimationFrame", {
    writable: true,
    value: vi.fn(),
  });
}

describe("Reveal", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mockMatchMedia(false);
    mockAnimationFrame();

    document.documentElement.removeAttribute("data-motion");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders children", () => {
    render(
      <Reveal>
        <span>Revealed content</span>
      </Reveal>,
    );

    expect(screen.getByText("Revealed content")).toBeInTheDocument();
  });

  it("renders hidden by default with default variant", () => {
    render(<Reveal>Content</Reveal>);

    const reveal = screen.getByText("Content");

    expect(reveal).toHaveClass("reveal");
    expect(reveal).toHaveAttribute("data-visible", "false");
    expect(reveal).toHaveAttribute("data-variant", "up");
  });

  it("merges custom className with base reveal class", () => {
    render(<Reveal className="custom-reveal-class">Content</Reveal>);

    const reveal = screen.getByText("Content");

    expect(reveal).toHaveClass("reveal");
    expect(reveal).toHaveClass("custom-reveal-class");
  });

  it("applies animation CSS variables", () => {
    render(
      <Reveal delay={120} duration={900} distance={48}>
        Content
      </Reveal>,
    );

    const reveal = screen.getByText("Content");

    expect(reveal.style.getPropertyValue("--reveal-delay")).toBe("120ms");
    expect(reveal.style.getPropertyValue("--reveal-duration")).toBe("900ms");
    expect(reveal.style.getPropertyValue("--reveal-distance")).toBe("48px");
  });

  it("supports fade variant", () => {
    render(<Reveal variant="fade">Content</Reveal>);

    expect(screen.getByText("Content")).toHaveAttribute("data-variant", "fade");
  });

  it("supports scale variant", () => {
    render(<Reveal variant="scale">Content</Reveal>);

    expect(screen.getByText("Content")).toHaveAttribute("data-variant", "scale");
  });

  it("creates intersection observer with provided options", () => {
    render(
      <Reveal threshold={0.5} rootMargin="10px">
        Content
      </Reveal>,
    );

    expect(MockIntersectionObserver.instances).toHaveLength(1);
    expect(MockIntersectionObserver.instances[0]?.options).toEqual({
      threshold: 0.5,
      rootMargin: "10px",
    });
  });

  it("observes reveal element", () => {
    render(<Reveal>Content</Reveal>);

    const reveal = screen.getByText("Content");
    const observer = MockIntersectionObserver.instances[0];

    expect(observer?.observe).toHaveBeenCalledWith(reveal);
  });

  it("does not become visible when entry is missing", () => {
    render(<Reveal>Content</Reveal>);

    const reveal = screen.getByText("Content");
    const observer = MockIntersectionObserver.instances[0];

    act(() => {
      observer?.callback([], observer as unknown as IntersectionObserver);
    });

    expect(reveal).toHaveAttribute("data-visible", "false");
  });

  it("does not become visible when element is not intersecting", () => {
    render(<Reveal>Content</Reveal>);

    const reveal = screen.getByText("Content");
    const observer = MockIntersectionObserver.instances[0];

    act(() => {
      observer?.trigger({
        isIntersecting: false,
        target: reveal,
      });
    });

    expect(reveal).toHaveAttribute("data-visible", "false");
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("becomes visible when element intersects", () => {
    render(<Reveal>Content</Reveal>);

    const reveal = screen.getByText("Content");
    const observer = MockIntersectionObserver.instances[0];

    act(() => {
      observer?.trigger({
        isIntersecting: true,
        target: reveal,
      });
    });

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(observer?.unobserve).toHaveBeenCalledWith(reveal);
    expect(reveal).toHaveAttribute("data-visible", "true");
  });

  it("does not create observer when reduced motion is enabled", () => {
    document.documentElement.dataset.motion = "disabled";

    render(<Reveal>Content</Reveal>);

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(screen.getByText("Content")).toHaveAttribute("data-visible", "false");
  });

  it("disconnects observer on unmount", () => {
    const { unmount } = render(<Reveal>Content</Reveal>);

    const observer = MockIntersectionObserver.instances[0];

    unmount();

    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
  });

  it("cancels scheduled animation frame on unmount", () => {
    const { unmount } = render(<Reveal>Content</Reveal>);

    const reveal = screen.getByText("Content");
    const observer = MockIntersectionObserver.instances[0];

    act(() => {
      observer?.trigger({
        isIntersecting: true,
        target: reveal,
      });
    });

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });
});
