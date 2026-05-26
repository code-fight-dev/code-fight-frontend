import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useSurrenderConfirm } from "@/views/arena-match-room/model/useSurrenderConfirm";

type HookParams = Parameters<typeof useSurrenderConfirm>[0];

function renderSurrenderConfirm(overrides: Partial<HookParams> = {}) {
  const onSurrender = vi.fn();

  const params: HookParams = {
    canSurrender: true,
    isSurrendering: false,
    onSurrender,
    ...overrides,
  };

  const view = renderHook((props: HookParams) => useSurrenderConfirm(props), {
    initialProps: params,
  });

  return {
    ...view,
    onSurrender,
    params,
  };
}

describe("views/arena-match-room/model/useSurrenderConfirm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a closed dialog by default", () => {
    const { result } = renderSurrenderConfirm();

    expect(result.current.isDialogOpen).toBe(false);
  });

  it("opens and closes the surrender confirmation dialog", () => {
    const { result } = renderSurrenderConfirm();

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isDialogOpen).toBe(true);

    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  it("does not open the dialog when surrender is not allowed", () => {
    const { result } = renderSurrenderConfirm({
      canSurrender: false,
    });

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  it("does not open the dialog while surrender is already in progress", () => {
    const { result } = renderSurrenderConfirm({
      isSurrendering: true,
    });

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  it("calls onSurrender and closes the dialog when surrender is confirmed", () => {
    const { result, onSurrender } = renderSurrenderConfirm();

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isDialogOpen).toBe(true);

    act(() => {
      result.current.confirmSurrender();
    });

    expect(onSurrender).toHaveBeenCalledTimes(1);
    expect(result.current.isDialogOpen).toBe(false);
  });

  it("does not confirm surrender when surrender is not allowed", () => {
    const { result, onSurrender } = renderSurrenderConfirm({
      canSurrender: false,
    });

    act(() => {
      result.current.confirmSurrender();
    });

    expect(onSurrender).not.toHaveBeenCalled();
    expect(result.current.isDialogOpen).toBe(false);
  });

  it("does not confirm surrender while surrender is already in progress", () => {
    const { result, onSurrender } = renderSurrenderConfirm({
      isSurrendering: true,
    });

    act(() => {
      result.current.confirmSurrender();
    });

    expect(onSurrender).not.toHaveBeenCalled();
    expect(result.current.isDialogOpen).toBe(false);
  });

  it("closes the dialog when Escape is pressed", () => {
    const { result } = renderSurrenderConfirm();

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isDialogOpen).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(result.current.isDialogOpen).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  it("removes the keydown listener when the dialog is closed", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { result } = renderSurrenderConfirm();

    act(() => {
      result.current.openDialog();
    });

    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    act(() => {
      result.current.closeDialog();
    });

    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("hides the dialog when surrender becomes unavailable after opening", () => {
    const { result, rerender, params } = renderSurrenderConfirm();

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isDialogOpen).toBe(true);

    rerender({
      ...params,
      canSurrender: false,
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  it("hides the dialog when surrender starts after opening", () => {
    const { result, rerender, params } = renderSurrenderConfirm();

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isDialogOpen).toBe(true);

    rerender({
      ...params,
      isSurrendering: true,
    });

    expect(result.current.isDialogOpen).toBe(false);
  });
});
