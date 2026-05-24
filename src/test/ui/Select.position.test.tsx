import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "@/shared/ui/Select";

const options = [
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" },
];

function readPixelValue(value: string) {
  return Number.parseFloat(value.replace("px", ""));
}

function mockWindowInnerHeight(value: number) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value,
  });
}

function mockTriggerRect(trigger: HTMLElement, rect: Partial<DOMRect> = {}) {
  vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
    x: rect.x ?? 24,
    y: rect.y ?? 180,
    left: rect.left ?? 24,
    top: rect.top ?? 180,
    right: rect.right ?? 184,
    bottom: rect.bottom ?? 220,
    width: rect.width ?? 160,
    height: rect.height ?? 40,
    toJSON: () => ({}),
  } as DOMRect);
}

function dispatchWindowScrollFrom(target: EventTarget) {
  const event = new Event("scroll", {
    bubbles: true,
    cancelable: true,
  });

  Object.defineProperty(event, "target", {
    configurable: true,
    value: target,
  });

  window.dispatchEvent(event);
}

function renderSelect() {
  const onValueChange = vi.fn();

  render(
    <Select
      aria-label="Programming language"
      onValueChange={onValueChange}
      options={options}
      placeholder="Choose language"
      value=""
    />,
  );

  const trigger = screen.getByRole("button", {
    name: "Programming language",
  });

  return {
    onValueChange,
    trigger,
  };
}

describe("Select listbox positioning", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render listbox before select is opened", () => {
    renderSelect();

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("positions listbox below trigger when there is enough space below", async () => {
    const user = userEvent.setup();
    const { trigger } = renderSelect();

    mockWindowInnerHeight(800);
    mockTriggerRect(trigger, {
      left: 24,
      top: 180,
      bottom: 220,
      width: 160,
    });

    await user.click(trigger);

    const listbox = screen.getByRole("listbox");
    const top = readPixelValue(listbox.style.top);
    const maxHeight = readPixelValue(listbox.style.maxHeight);

    expect(listbox.style.left).toBe("24px");
    expect(listbox.style.width).toBe("160px");
    expect(top).toBeGreaterThan(220);
    expect(maxHeight).toBeGreaterThanOrEqual(160);
    expect(maxHeight).toBeLessThanOrEqual(256);
  });

  it("positions listbox above trigger when there is not enough space below", async () => {
    const user = userEvent.setup();
    const { trigger } = renderSelect();

    mockWindowInnerHeight(300);
    mockTriggerRect(trigger, {
      left: 24,
      top: 220,
      bottom: 250,
      width: 160,
    });

    await user.click(trigger);

    const listbox = screen.getByRole("listbox");
    const top = readPixelValue(listbox.style.top);
    const maxHeight = readPixelValue(listbox.style.maxHeight);

    expect(listbox.style.left).toBe("24px");
    expect(listbox.style.width).toBe("160px");
    expect(top).toBeLessThan(220);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(maxHeight).toBeGreaterThanOrEqual(160);
    expect(maxHeight).toBeLessThanOrEqual(256);
  });

  it("updates listbox position on window resize", async () => {
    const user = userEvent.setup();
    const { trigger } = renderSelect();

    mockWindowInnerHeight(800);
    const rectSpy = vi.spyOn(trigger, "getBoundingClientRect");

    rectSpy.mockReturnValue({
      x: 24,
      y: 180,
      left: 24,
      top: 180,
      right: 184,
      bottom: 220,
      width: 160,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);

    await user.click(trigger);

    const listboxBeforeResize = screen.getByRole("listbox");
    const topBeforeResize = readPixelValue(listboxBeforeResize.style.top);

    expect(listboxBeforeResize.style.left).toBe("24px");
    expect(listboxBeforeResize.style.width).toBe("160px");
    expect(topBeforeResize).toBeGreaterThan(220);

    rectSpy.mockReturnValue({
      x: 40,
      y: 200,
      left: 40,
      top: 200,
      right: 240,
      bottom: 240,
      width: 200,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.resize(window);

    const listboxAfterResize = screen.getByRole("listbox");
    const topAfterResize = readPixelValue(listboxAfterResize.style.top);

    expect(listboxAfterResize.style.left).toBe("40px");
    expect(listboxAfterResize.style.width).toBe("200px");
    expect(topAfterResize).toBeGreaterThan(240);
    expect(topAfterResize).not.toBe(topBeforeResize);
  });

  it("closes listbox when window scroll happens outside listbox", async () => {
    const user = userEvent.setup();
    const { trigger } = renderSelect();

    mockWindowInnerHeight(800);
    mockTriggerRect(trigger);

    await user.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    act(() => {
      dispatchWindowScrollFrom(document.body);
    });

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("keeps listbox open when scroll happens inside listbox", async () => {
    const user = userEvent.setup();
    const { trigger } = renderSelect();

    mockWindowInnerHeight(800);
    mockTriggerRect(trigger);

    await user.click(trigger);

    const listbox = screen.getByRole("listbox");

    act(() => {
      dispatchWindowScrollFrom(listbox);
    });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
