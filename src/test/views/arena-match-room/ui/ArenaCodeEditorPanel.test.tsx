import { act, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import { ArenaCodeEditorPanel } from "@/views/arena-match-room/ui/ArenaCodeEditorPanel";

const editorPanelMocks = vi.hoisted(() => ({
  ensureMonacoConfigured: vi.fn(),
  usePreferences: vi.fn(),
  ConfiguredMonacoEditor: vi.fn(),
}));

vi.mock("@/features/preferences/ui/PreferencesProvider", () => ({
  usePreferences: editorPanelMocks.usePreferences,
}));

vi.mock("@/views/arena-match-room/ui/code-editor/ConfiguredMonacoEditor", () => ({
  ConfiguredMonacoEditor: (props: Record<string, unknown>) => {
    editorPanelMocks.ConfiguredMonacoEditor(props);
    return <div data-testid="configured-monaco-editor">configured editor</div>;
  },
}));

vi.mock("@/views/arena-match-room/ui/code-editor/MonacoLoadingView", () => ({
  MonacoLoadingView: () => <div data-testid="monaco-loading-view">loading editor</div>,
}));

vi.mock("@/views/arena-match-room/ui/code-editor/ensureMonacoConfigured", () => ({
  ensureMonacoConfigured: editorPanelMocks.ensureMonacoConfigured,
}));

type Props = ComponentProps<typeof ArenaCodeEditorPanel>;

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

function getLastConfiguredEditorProps() {
  const lastCall = editorPanelMocks.ConfiguredMonacoEditor.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("ConfiguredMonacoEditor was not rendered");
  }

  return lastCall[0] as {
    language: string;
    value: string;
    fileName?: string;
    editorTheme: string;
    editorOptions: Record<string, unknown>;
    onChange: (value: string) => void;
  };
}

function renderEditorPanel(overrides: Partial<Props> = {}) {
  const props: Props = {
    language: "typescript",
    value: "const answer = 42;",
    fileName: "solution.ts",
    onChange: vi.fn(),
    ...overrides,
  };

  const result = render(<ArenaCodeEditorPanel {...props} />);

  return {
    ...result,
    props,
  };
}

function installMutationObserverMock() {
  const observe = vi.fn();
  const disconnect = vi.fn();

  const observers: Array<{
    callback: MutationCallback;
    target: Node | null;
    options: MutationObserverInit | null;
  }> = [];
  let callbackCallCount = 0;

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
    hasCallback: () =>
      observers.some(
        (observer) => observer.options?.attributeFilter?.includes("data-theme") ?? false,
      ),
    callbackCallCount: () => callbackCallCount,
    emitThemeMutation,
  };
}

describe("views/arena-match-room/ui/ArenaCodeEditorPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    document.documentElement.dataset.theme = "dark";

    editorPanelMocks.usePreferences.mockReturnValue({
      preferences: {
        theme: "default",
        motion: "enabled",
        editor: DEFAULT_EDITOR_PREFERENCES,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute("data-theme");
  });

  it("shows loading state first and then renders configured editor after Monaco init", async () => {
    const deferred = createDeferredPromise();
    editorPanelMocks.ensureMonacoConfigured.mockReturnValueOnce(deferred.promise);

    const { props } = renderEditorPanel();

    expect(screen.getByText("solution.ts")).toBeInTheDocument();
    expect(screen.getByTestId("monaco-loading-view")).toBeInTheDocument();
    expect(screen.queryByTestId("configured-monaco-editor")).not.toBeInTheDocument();

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("configured-monaco-editor")).toBeInTheDocument();
    });

    const editorProps = getLastConfiguredEditorProps();
    expect(editorProps.language).toBe("typescript");
    expect(editorProps.value).toBe("const answer = 42;");
    expect(editorProps.editorTheme).toBe("codefight-dark");
    expect(editorProps.editorOptions).toMatchObject({
      automaticLayout: true,
      fontSize: DEFAULT_EDITOR_PREFERENCES.fontSize,
      lineHeight: DEFAULT_EDITOR_PREFERENCES.lineHeight,
      tabSize: DEFAULT_EDITOR_PREFERENCES.tabSize,
    });

    editorProps.onChange("next value");
    expect(props.onChange).toHaveBeenCalledWith("next value");
  });

  it("keeps loading state when Monaco init fails", async () => {
    editorPanelMocks.ensureMonacoConfigured.mockRejectedValueOnce(
      new Error("monaco failed"),
    );

    renderEditorPanel();

    await waitFor(() => {
      expect(editorPanelMocks.ensureMonacoConfigured).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("monaco-loading-view")).toBeInTheDocument();
    expect(screen.queryByTestId("configured-monaco-editor")).not.toBeInTheDocument();
  });

  it("subscribes to document theme changes and cleans observer on unmount", async () => {
    const mutationObserver = installMutationObserverMock();
    editorPanelMocks.ensureMonacoConfigured.mockResolvedValueOnce(undefined);

    const { unmount } = renderEditorPanel();

    await waitFor(() => {
      expect(screen.getByTestId("configured-monaco-editor")).toBeInTheDocument();
    });

    expect(getLastConfiguredEditorProps().editorTheme).toBe("codefight-dark");
    expect(mutationObserver.observe).toHaveBeenCalledWith(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    expect(mutationObserver.hasCallback()).toBe(true);

    act(() => {
      mutationObserver.emitThemeMutation();
    });
    expect(mutationObserver.callbackCallCount()).toBe(1);

    unmount();
    expect(mutationObserver.disconnect).toHaveBeenCalled();
  });

  it("updates editor theme when observed app theme changes", async () => {
    const mutationObserver = installMutationObserverMock();
    editorPanelMocks.ensureMonacoConfigured.mockResolvedValueOnce(undefined);

    renderEditorPanel();

    await waitFor(() => {
      expect(screen.getByTestId("configured-monaco-editor")).toBeInTheDocument();
    });

    expect(getLastConfiguredEditorProps().editorTheme).toBe("codefight-dark");

    document.documentElement.dataset.theme = "light";

    act(() => {
      mutationObserver.emitThemeMutation();
    });

    await waitFor(() => {
      expect(getLastConfiguredEditorProps().editorTheme).toBe("codefight-light");
    });
  });

  it("does not update state after unmount when Monaco initialization resolves", async () => {
    const deferred = createDeferredPromise();
    editorPanelMocks.ensureMonacoConfigured.mockReturnValueOnce(deferred.promise);

    const { unmount } = renderEditorPanel();
    unmount();

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    expect(editorPanelMocks.ConfiguredMonacoEditor).not.toHaveBeenCalled();
  });

  it("does not update state after unmount when Monaco initialization rejects", async () => {
    const deferred = createDeferredPromise();
    editorPanelMocks.ensureMonacoConfigured.mockReturnValueOnce(deferred.promise);

    const { unmount } = renderEditorPanel();
    unmount();

    await act(async () => {
      deferred.reject(new Error("late failure"));
      await deferred.promise.catch(() => undefined);
    });

    expect(editorPanelMocks.ConfiguredMonacoEditor).not.toHaveBeenCalled();
  });
});
