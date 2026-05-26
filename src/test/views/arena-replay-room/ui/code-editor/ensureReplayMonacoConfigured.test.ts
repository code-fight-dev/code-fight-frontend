import { afterEach, describe, expect, it, vi } from "vitest";

const MODULE_PATH =
  "@/views/arena-replay-room/ui/code-editor/ensureReplayMonacoConfigured";

describe("views/arena-replay-room/ui/code-editor/ensureReplayMonacoConfigured", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("@monaco-editor/react");
    vi.doUnmock("monaco-editor");
  });

  it("configures Monaco loader once and returns a cached promise", async () => {
    const loaderConfig = vi.fn();

    vi.doMock("@monaco-editor/react", () => ({
      loader: {
        config: loaderConfig,
      },
    }));

    vi.doMock("monaco-editor", () => ({
      editor: {},
    }));

    const { ensureReplayMonacoConfigured } = await import(MODULE_PATH);

    const firstCall = ensureReplayMonacoConfigured();
    const secondCall = ensureReplayMonacoConfigured();

    expect(secondCall).toBe(firstCall);
    await firstCall;

    expect(loaderConfig).toHaveBeenCalledTimes(1);
    expect(loaderConfig).toHaveBeenCalledWith({
      monaco: expect.objectContaining({
        editor: expect.any(Object),
      }),
    });
  });

  it("clears cached promise when configuration fails so retry is possible", async () => {
    const loaderConfig = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("Replay Monaco configure failed");
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

    const { ensureReplayMonacoConfigured } = await import(MODULE_PATH);

    const firstCall = ensureReplayMonacoConfigured();
    await expect(firstCall).rejects.toThrow("Replay Monaco configure failed");

    const secondCall = ensureReplayMonacoConfigured();
    expect(secondCall).not.toBe(firstCall);

    await expect(secondCall).resolves.toBeUndefined();
    expect(loaderConfig).toHaveBeenCalledTimes(2);
  });
});
