import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CodeEditorPanel } from "@/views/challenges/ui/CodeEditorPanel";

const codeEditorMocks = vi.hoisted(() => ({
  loaderConfig: vi.fn(),
  useMonaco: vi.fn(),
  dynamicEditor: vi.fn(),
  usePreferences: vi.fn(),
  buildMonacoEditorOptions: vi.fn(),
  defineCodeFightMonacoThemes: vi.fn(),
  getCurrentAppTheme: vi.fn(),
  resolveMonacoThemeName: vi.fn(),
  setTheme: vi.fn(),
}));

vi.mock("monaco-editor", () => ({}));

vi.mock("@monaco-editor/react", () => ({
  loader: {
    config: codeEditorMocks.loaderConfig,
  },
  useMonaco: codeEditorMocks.useMonaco,
}));

vi.mock("next/dynamic", () => ({
  default: (
    loader: () => Promise<unknown>,
    options?: {
      loading?: () => unknown;
    },
  ) => {
    void loader();
    options?.loading?.();

    return (props: Record<string, unknown>) => {
      codeEditorMocks.dynamicEditor(props);
      return <div data-testid="challenge-monaco-editor">editor</div>;
    };
  },
}));

vi.mock("@/features/preferences/ui/PreferencesProvider", () => ({
  usePreferences: codeEditorMocks.usePreferences,
}));

vi.mock("@/features/preferences/model/editor", () => ({
  buildMonacoEditorOptions: codeEditorMocks.buildMonacoEditorOptions,
}));

vi.mock("@/features/preferences/model/editorMonaco", () => ({
  defineCodeFightMonacoThemes: codeEditorMocks.defineCodeFightMonacoThemes,
  getCurrentAppTheme: codeEditorMocks.getCurrentAppTheme,
  resolveMonacoThemeName: codeEditorMocks.resolveMonacoThemeName,
}));

function getLastEditorProps() {
  const lastCall = codeEditorMocks.dynamicEditor.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("Monaco editor was not rendered");
  }

  return lastCall[0] as {
    language: string;
    value: string;
    theme: string;
    beforeMount: (monacoInstance: unknown) => void;
    onChange: (value?: string) => void;
    options: Record<string, unknown>;
  };
}

function installMutationObserverMock() {
  let callback: MutationCallback | null = null;
  const observe = vi.fn();
  const disconnect = vi.fn();

  class MockMutationObserver {
    constructor(nextCallback: MutationCallback) {
      callback = nextCallback;
    }

    observe = observe;
    disconnect = disconnect;
  }

  vi.stubGlobal("MutationObserver", MockMutationObserver);

  return {
    observe,
    disconnect,
    emit: () => {
      if (callback) {
        callback([], {} as MutationObserver);
      }
    },
  };
}

describe("views/challenges/ui/CodeEditorPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    codeEditorMocks.usePreferences.mockReturnValue({
      preferences: {
        editor: {
          useAppTheme: true,
        },
      },
    });
    codeEditorMocks.buildMonacoEditorOptions.mockReturnValue({
      minimap: { enabled: false },
    });
    codeEditorMocks.getCurrentAppTheme.mockReturnValue("dark");
    codeEditorMocks.resolveMonacoThemeName.mockImplementation((theme) =>
      theme === "dark" ? "codefight-dark" : "codefight-light",
    );
    codeEditorMocks.useMonaco.mockReturnValue({
      editor: {
        setTheme: codeEditorMocks.setTheme,
      },
    });
  });

  it("configures loader and renders Monaco editor with computed props", () => {
    render(
      <CodeEditorPanel
        language="typescript"
        value="const answer = 42;"
        fileName="solution.ts"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("solution.ts")).toBeInTheDocument();
    expect(screen.getByTestId("challenge-monaco-editor")).toBeInTheDocument();

    const editorProps = getLastEditorProps();
    expect(editorProps.language).toBe("typescript");
    expect(editorProps.value).toBe("const answer = 42;");
    expect(editorProps.theme).toBe("codefight-dark");
    expect(editorProps.options).toEqual({ minimap: { enabled: false } });

    editorProps.beforeMount({});
    expect(codeEditorMocks.defineCodeFightMonacoThemes).toHaveBeenCalledTimes(1);
  });

  it("forwards editor change and applies theme updates from app theme observer", () => {
    const onChange = vi.fn();
    const mutationObserver = installMutationObserverMock();

    render(
      <CodeEditorPanel
        language="python"
        value="print('ok')"
        fileName="solution.py"
        onChange={onChange}
      />,
    );

    expect(codeEditorMocks.setTheme).toHaveBeenCalledWith("codefight-dark");
    expect(mutationObserver.observe).toHaveBeenCalledWith(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    act(() => {
      mutationObserver.emit();
    });
    expect(codeEditorMocks.setTheme).toHaveBeenCalledTimes(1);

    const editorProps = getLastEditorProps();
    editorProps.onChange("next");
    editorProps.onChange(undefined);
    expect(onChange).toHaveBeenNthCalledWith(1, "next");
    expect(onChange).toHaveBeenNthCalledWith(2, "");

    codeEditorMocks.getCurrentAppTheme.mockReturnValue("light");

    act(() => {
      mutationObserver.emit();
    });

    expect(codeEditorMocks.setTheme).toHaveBeenLastCalledWith("codefight-light");
  });

  it("skips Monaco theme updates when Monaco instance is unavailable", () => {
    codeEditorMocks.useMonaco.mockReturnValue(null);

    render(
      <CodeEditorPanel
        language="typescript"
        value="const value = 1;"
        fileName="solution.ts"
        onChange={vi.fn()}
      />,
    );

    expect(codeEditorMocks.setTheme).not.toHaveBeenCalled();
  });
});
