import { afterEach, describe, expect, it, vi } from "vitest";

const MODULE_PATH = "@/views/arena-match-room/ui/code-editor/ensureMonacoConfigured";

describe("views/arena-match-room/ui/code-editor/ensureMonacoConfigured", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("@monaco-editor/react");
    vi.doUnmock("monaco-editor");
  });

  it("configures Monaco loader once and reuses the same promise", async () => {
    const loaderConfig = vi.fn();

    vi.doMock("@monaco-editor/react", () => ({
      loader: {
        config: loaderConfig,
      },
    }));

    vi.doMock("monaco-editor", () => ({
      editor: {},
    }));

    const { ensureMonacoConfigured } = await import(MODULE_PATH);

    const firstCall = ensureMonacoConfigured();
    const secondCall = ensureMonacoConfigured();

    expect(secondCall).toBe(firstCall);

    await firstCall;

    expect(loaderConfig).toHaveBeenCalledTimes(1);
    expect(loaderConfig).toHaveBeenCalledWith({
      monaco: expect.objectContaining({
        editor: expect.any(Object),
      }),
    });
  });

  it("resets cached promise after failure so initialization can retry", async () => {
    const loaderConfig = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("Failed to configure Monaco");
      })
      .mockImplementation(() => undefined);

    vi.doMock("@monaco-editor/react", () => ({
      loader: {
        config: loaderConfig,
      },
    }));

    vi.doMock("monaco-editor", () => ({
      editor: {},
    }));

    const { ensureMonacoConfigured } = await import(MODULE_PATH);

    const firstCall = ensureMonacoConfigured();
    await expect(firstCall).rejects.toThrow("Failed to configure Monaco");

    const secondCall = ensureMonacoConfigured();
    expect(secondCall).not.toBe(firstCall);

    await expect(secondCall).resolves.toBeUndefined();
    expect(loaderConfig).toHaveBeenCalledTimes(2);
  });
});
