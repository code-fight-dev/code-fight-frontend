import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MonacoEditorProps = {
  height: string;
  language: string;
  theme: string;
  value: string;
  beforeMount?: (monacoInstance: unknown) => void;
  options: Record<string, unknown>;
};

type DynamicLoader = () => Promise<unknown>;

type DynamicOptions = {
  loading?: () => unknown;
};

const mocks = vi.hoisted(() => ({
  loaderConfig: vi.fn(),
  useMonaco: vi.fn(),
  setTheme: vi.fn(),

  buildMonacoEditorOptions: vi.fn(),
  defineCodeFightMonacoThemes: vi.fn(),
  getCurrentAppTheme: vi.fn(),
  resolveMonacoThemeName: vi.fn(),
  usePreferences: vi.fn(),

  monacoEditor: vi.fn(),
}));

vi.mock("monaco-editor", () => ({
  editor: {},
}));

vi.mock("@monaco-editor/react", () => ({
  loader: {
    config: mocks.loaderConfig,
  },
  useMonaco: mocks.useMonaco,
  default: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: (loader: DynamicLoader, options?: DynamicOptions) => {
    void loader();

    return function DynamicMonacoEditor(props: MonacoEditorProps) {
      options?.loading?.();
      props.beforeMount?.({ editor: {} });
      mocks.monacoEditor(props);

      return "Monaco editor mock";
    };
  },
}));

vi.mock("@/features/preferences", () => ({
  buildMonacoEditorOptions: mocks.buildMonacoEditorOptions,
  defineCodeFightMonacoThemes: mocks.defineCodeFightMonacoThemes,
  getCurrentAppTheme: mocks.getCurrentAppTheme,
  resolveMonacoThemeName: mocks.resolveMonacoThemeName,
  usePreferences: mocks.usePreferences,
}));

import { DocsMonacoSnippet } from "@/views/docs/ui/DocsMonacoSnippet";

function getLastEditorProps(): MonacoEditorProps {
  const lastCall = mocks.monacoEditor.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("Monaco editor mock was not rendered.");
  }

  return lastCall[0] as MonacoEditorProps;
}

function installMutationObserverMock() {
  let callback: (() => void) | null = null;

  const observe = vi.fn();
  const disconnect = vi.fn();

  class MockMutationObserver {
    constructor(nextCallback: () => void) {
      callback = nextCallback;
    }

    observe = observe;
    disconnect = disconnect;
  }

  vi.stubGlobal("MutationObserver", MockMutationObserver);

  return {
    observe,
    disconnect,
    emit: () => callback?.(),
  };
}

let mutationObserver: ReturnType<typeof installMutationObserverMock>;

describe("views/docs/ui/DocsMonacoSnippet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    mutationObserver = installMutationObserverMock();

    mocks.useMonaco.mockReturnValue({
      editor: {
        setTheme: mocks.setTheme,
      },
    });

    mocks.getCurrentAppTheme.mockReturnValue("dark");

    mocks.resolveMonacoThemeName.mockImplementation(
      (appTheme: "dark" | "light", useAppTheme: boolean) =>
        useAppTheme ? `codefight-${appTheme}` : `custom-${appTheme}`,
    );

    mocks.buildMonacoEditorOptions.mockReturnValue({
      fontSize: 14,
      lineHeight: 22,
      readOnly: false,
      minimap: {
        enabled: true,
      },
    });

    mocks.usePreferences.mockReturnValue({
      preferences: {
        editor: {
          useAppTheme: true,
          fontSize: 14,
          lineHeight: 22,
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the default file name and passes readonly Monaco props", () => {
    render(<DocsMonacoSnippet value="const answer = 42;" />);

    expect(screen.getByText("request.ts")).toBeTruthy();
    expect(screen.getByText("Monaco editor mock")).toBeTruthy();

    expect(getLastEditorProps()).toMatchObject({
      height: "100%",
      language: "typescript",
      theme: "codefight-dark",
      value: "const answer = 42;",
    });

    expect(mocks.defineCodeFightMonacoThemes).toHaveBeenCalledTimes(1);
    expect(mocks.setTheme).toHaveBeenCalledWith("codefight-dark");

    expect(getLastEditorProps().options).toMatchObject({
      fontSize: 14,
      lineHeight: 22,
      contextmenu: false,
      domReadOnly: true,
      folding: false,
      lineNumbersMinChars: 3,
      minimap: {
        enabled: false,
      },
      readOnly: true,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      padding: {
        top: 14,
        bottom: 14,
      },
    });
  });

  it("renders custom file name and language", () => {
    render(
      <DocsMonacoSnippet fileName="response.json" language="json" value='{"ok":true}' />,
    );

    expect(screen.getByText("response.json")).toBeTruthy();

    expect(getLastEditorProps()).toMatchObject({
      language: "json",
      theme: "codefight-dark",
      value: '{"ok":true}',
    });
  });

  it("resolves custom Monaco theme when app theme sync is disabled", () => {
    mocks.usePreferences.mockReturnValue({
      preferences: {
        editor: {
          useAppTheme: false,
          fontSize: 16,
        },
      },
    });

    render(<DocsMonacoSnippet value="console.log('custom theme');" />);

    expect(mocks.resolveMonacoThemeName).toHaveBeenCalledWith("dark", false);
    expect(getLastEditorProps().theme).toBe("custom-dark");
  });

  it("does not set Monaco theme before Monaco instance is ready", () => {
    mocks.useMonaco.mockReturnValue(null);

    render(<DocsMonacoSnippet value="console.log('pending');" />);

    expect(mocks.setTheme).not.toHaveBeenCalled();
  });

  it("observes app theme changes and disconnects on unmount", async () => {
    const { unmount } = render(<DocsMonacoSnippet value="const theme = true;" />);

    expect(mutationObserver.observe).toHaveBeenCalledWith(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    expect(getLastEditorProps().theme).toBe("codefight-dark");

    mocks.getCurrentAppTheme.mockReturnValueOnce("dark");

    act(() => {
      mutationObserver.emit();
    });

    expect(getLastEditorProps().theme).toBe("codefight-dark");

    mocks.getCurrentAppTheme.mockReturnValueOnce("light");

    act(() => {
      mutationObserver.emit();
    });

    await waitFor(() => {
      expect(getLastEditorProps().theme).toBe("codefight-light");
    });

    expect(mocks.setTheme).toHaveBeenCalledWith("codefight-light");

    const disconnectCallsBeforeUnmount = mutationObserver.disconnect.mock.calls.length;

    unmount();

    expect(mutationObserver.disconnect).toHaveBeenCalledTimes(
      disconnectCallsBeforeUnmount + 1,
    );
  });
});
