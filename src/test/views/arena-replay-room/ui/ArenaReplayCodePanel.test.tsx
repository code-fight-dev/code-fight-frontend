import { act, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import { ArenaReplayCodePanel } from "@/views/arena-replay-room/ui/ArenaReplayCodePanel";

const replayCodePanelMocks = vi.hoisted(() => ({
  buildMonacoEditorOptions: vi.fn(),
  getCurrentAppTheme: vi.fn(),
  resolveMonacoThemeName: vi.fn(),
  usePreferences: vi.fn(),
  ensureReplayMonacoConfigured: vi.fn(),
  ReplayMonacoEditor: vi.fn(),
}));

vi.mock("@/features/preferences", () => ({
  buildMonacoEditorOptions: replayCodePanelMocks.buildMonacoEditorOptions,
  getCurrentAppTheme: replayCodePanelMocks.getCurrentAppTheme,
  resolveMonacoThemeName: replayCodePanelMocks.resolveMonacoThemeName,
  usePreferences: replayCodePanelMocks.usePreferences,
}));

vi.mock("@/views/arena-replay-room/ui/code-editor/ReplayMonacoEditor", () => ({
  ReplayMonacoEditor: (props: Record<string, unknown>) => {
    replayCodePanelMocks.ReplayMonacoEditor(props);
    return <div data-testid="replay-monaco-editor">replay editor</div>;
  },
}));

vi.mock("@/views/arena-replay-room/ui/code-editor/ReplayMonacoLoadingView", () => ({
  ReplayMonacoLoadingView: () => (
    <div data-testid="replay-monaco-loading-view">loading replay editor</div>
  ),
}));

vi.mock("@/views/arena-replay-room/ui/code-editor/ensureReplayMonacoConfigured", () => ({
  ensureReplayMonacoConfigured: replayCodePanelMocks.ensureReplayMonacoConfigured,
}));

type Props = ComponentProps<typeof ArenaReplayCodePanel>;

function createDeferredPromise() {
  let resolvePromise: () => void = () => {};
  let rejectPromise: (error: unknown) => void = () => {};

  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise,
  };
}

function getLastReplayEditorProps() {
  const lastCall = replayCodePanelMocks.ReplayMonacoEditor.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("ReplayMonacoEditor was not rendered");
  }

  return lastCall[0] as {
    language: string;
    value: string;
    editorTheme: string;
    editorOptions: Record<string, unknown>;
  };
}

function renderCodePanel(overrides: Partial<Props> = {}) {
  const props: Props = {
    canViewSourceCode: true,
    language: "typescript",
    code: "const replay = true;",
    title: "Replay challenge",
    verdict: "accepted",
    status: "finished",
    ...overrides,
  };

  const result = render(<ArenaReplayCodePanel {...props} />);

  return {
    ...result,
    props,
  };
}

function installMutationObserverMock() {
  const observe = vi.fn();
  const disconnect = vi.fn();
  let callbackCallCount = 0;
  const observers: Array<{
    callback: MutationCallback;
    target: Node | null;
    options: MutationObserverInit | null;
  }> = [];

  class MockMutationObserver {
    private readonly callback: MutationCallback;

    constructor(nextCallback: MutationCallback) {
      this.callback = nextCallback;
      observers.push({
        callback: nextCallback,
        target: null,
        options: null,
      });
    }

    observe = (target: Node, options?: MutationObserverInit) => {
      observe(target, options);

      const observerState = observers.find(
        (observer) => observer.callback === this.callback,
      );
      if (!observerState) {
        return;
      }

      observerState.target = target;
      observerState.options = options ?? null;
    };

    disconnect = disconnect;
  }

  vi.stubGlobal("MutationObserver", MockMutationObserver);

  const emitThemeMutation = () => {
    const themeObserver = observers.find((observer) => {
      if (observer.target !== document.documentElement) {
        return false;
      }

      return observer.options?.attributeFilter?.includes("data-theme") ?? false;
    });

    if (!themeObserver) {
      return;
    }

    callbackCallCount += 1;
    themeObserver.callback([], {} as MutationObserver);
  };

  return {
    observe,
    disconnect,
    emitThemeMutation,
    callbackCallCount: () => callbackCallCount,
  };
}

describe("views/arena-replay-room/ui/ArenaReplayCodePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    document.documentElement.dataset.theme = "dark";

    replayCodePanelMocks.usePreferences.mockReturnValue({
      preferences: {
        theme: "default",
        motion: "enabled",
        editor: DEFAULT_EDITOR_PREFERENCES,
      },
    });

    replayCodePanelMocks.buildMonacoEditorOptions.mockReturnValue({
      fontSize: 14,
      lineHeight: 22,
      minimap: { enabled: true },
    });

    replayCodePanelMocks.getCurrentAppTheme.mockImplementation(() =>
      document.documentElement.dataset.theme === "light" ? "light" : "dark",
    );

    replayCodePanelMocks.resolveMonacoThemeName.mockImplementation(
      (appTheme: "dark" | "light", useAppTheme: boolean) =>
        useAppTheme ? `codefight-${appTheme}` : "codefight-dark",
    );

    replayCodePanelMocks.ensureReplayMonacoConfigured.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders hidden state when source code is unavailable and skips Monaco setup", () => {
    renderCodePanel({
      canViewSourceCode: false,
      status: "running",
      verdict: undefined,
    });

    expect(screen.getByText("Replay Editor")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Replay challenge", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Source hidden")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();
    expect(
      screen.getByText("Source code is hidden for this replay."),
    ).toBeInTheDocument();

    expect(replayCodePanelMocks.ensureReplayMonacoConfigured).not.toHaveBeenCalled();
    expect(screen.queryByTestId("replay-monaco-loading-view")).not.toBeInTheDocument();
    expect(screen.queryByTestId("replay-monaco-editor")).not.toBeInTheDocument();
  });

  it("initializes Monaco and renders replay editor with readonly options", async () => {
    const deferred = createDeferredPromise();
    replayCodePanelMocks.ensureReplayMonacoConfigured.mockReturnValueOnce(
      deferred.promise,
    );

    renderCodePanel({
      verdict: "wrong_answer",
    });

    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("wrong answer")).toBeInTheDocument();
    expect(screen.getByTestId("replay-monaco-loading-view")).toBeInTheDocument();

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("replay-monaco-editor")).toBeInTheDocument();
    });

    expect(replayCodePanelMocks.resolveMonacoThemeName).toHaveBeenCalledWith(
      "dark",
      true,
    );

    const editorProps = getLastReplayEditorProps();
    expect(editorProps.language).toBe("typescript");
    expect(editorProps.value).toBe("const replay = true;");
    expect(editorProps.editorTheme).toBe("codefight-dark");
    expect(editorProps.editorOptions).toMatchObject({
      fontSize: 14,
      lineHeight: 22,
      readOnly: true,
      domReadOnly: true,
      minimap: { enabled: false },
    });
  });

  it("keeps loading view when Monaco initialization fails", async () => {
    replayCodePanelMocks.ensureReplayMonacoConfigured.mockRejectedValueOnce(
      new Error("Replay Monaco failed"),
    );

    renderCodePanel();

    await waitFor(() => {
      expect(replayCodePanelMocks.ensureReplayMonacoConfigured).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("replay-monaco-loading-view")).toBeInTheDocument();
    expect(screen.queryByTestId("replay-monaco-editor")).not.toBeInTheDocument();
  });

  it("reacts to observed theme changes and disconnects observer on unmount", async () => {
    const mutationObserver = installMutationObserverMock();
    replayCodePanelMocks.ensureReplayMonacoConfigured.mockResolvedValueOnce(undefined);

    const { unmount } = renderCodePanel();

    await waitFor(() => {
      expect(screen.getByTestId("replay-monaco-editor")).toBeInTheDocument();
    });

    const callsBeforeThemeChange =
      replayCodePanelMocks.ReplayMonacoEditor.mock.calls.length;

    act(() => {
      mutationObserver.emitThemeMutation();
    });
    expect(mutationObserver.callbackCallCount()).toBe(1);
    expect(replayCodePanelMocks.ReplayMonacoEditor.mock.calls.length).toBe(
      callsBeforeThemeChange,
    );

    document.documentElement.dataset.theme = "light";

    act(() => {
      mutationObserver.emitThemeMutation();
    });

    await waitFor(() => {
      expect(getLastReplayEditorProps().editorTheme).toBe("codefight-light");
    });

    expect(mutationObserver.observe).toHaveBeenCalledWith(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    unmount();
    expect(mutationObserver.disconnect).toHaveBeenCalled();
  });

  it("applies fallback status text when verdict and status are missing", () => {
    renderCodePanel({
      verdict: undefined,
      status: undefined,
    });

    expect(screen.getByText("snapshot")).toBeInTheDocument();
  });

  it("does not update state after unmount when Monaco resolves or rejects late", async () => {
    const resolveDeferred = createDeferredPromise();
    replayCodePanelMocks.ensureReplayMonacoConfigured.mockReturnValueOnce(
      resolveDeferred.promise,
    );

    const firstRender = renderCodePanel();
    firstRender.unmount();

    await act(async () => {
      resolveDeferred.resolve();
      await resolveDeferred.promise;
    });

    const rejectDeferred = createDeferredPromise();
    replayCodePanelMocks.ensureReplayMonacoConfigured.mockReturnValueOnce(
      rejectDeferred.promise,
    );

    const secondRender = renderCodePanel();
    secondRender.unmount();

    await act(async () => {
      rejectDeferred.reject(new Error("late replay failure"));
      await rejectDeferred.promise.catch(() => undefined);
    });

    expect(replayCodePanelMocks.ReplayMonacoEditor).not.toHaveBeenCalled();
  });
});
