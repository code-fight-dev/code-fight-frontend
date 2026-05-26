import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReplayMonacoEditor } from "@/views/arena-replay-room/ui/code-editor/ReplayMonacoEditor";

const replayMonacoEditorMocks = vi.hoisted(() => ({
  useMonaco: vi.fn(),
  dynamicEditor: vi.fn(),
  defineCodeFightMonacoThemes: vi.fn(),
  setTheme: vi.fn(),
}));

vi.mock("@monaco-editor/react", () => ({
  useMonaco: replayMonacoEditorMocks.useMonaco,
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
      replayMonacoEditorMocks.dynamicEditor(props);
      return <div data-testid="replay-dynamic-editor">replay dynamic editor</div>;
    };
  },
}));

vi.mock("@/features/preferences", () => ({
  defineCodeFightMonacoThemes: replayMonacoEditorMocks.defineCodeFightMonacoThemes,
}));

function getLastDynamicEditorProps() {
  const lastCall = replayMonacoEditorMocks.dynamicEditor.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("Dynamic replay Monaco editor was not rendered");
  }

  return lastCall[0] as {
    language: string;
    theme: string;
    value: string;
    beforeMount?: (monacoInstance: unknown) => void;
    options: Record<string, unknown>;
  };
}

describe("views/arena-replay-room/ui/code-editor/ReplayMonacoEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dynamic Monaco editor with replay props", () => {
    replayMonacoEditorMocks.useMonaco.mockReturnValue({
      editor: {
        setTheme: replayMonacoEditorMocks.setTheme,
      },
    });

    render(
      <ReplayMonacoEditor
        language="typescript"
        value="const replay = true;"
        editorTheme="codefight-dark"
        editorOptions={{ readOnly: true, minimap: { enabled: false } }}
      />,
    );

    const editorProps = getLastDynamicEditorProps();

    expect(editorProps.language).toBe("typescript");
    expect(editorProps.theme).toBe("codefight-dark");
    expect(editorProps.value).toBe("const replay = true;");
    expect(editorProps.options).toMatchObject({
      readOnly: true,
      minimap: { enabled: false },
    });

    editorProps.beforeMount?.({ editor: {} });
    expect(replayMonacoEditorMocks.defineCodeFightMonacoThemes).toHaveBeenCalledTimes(1);
    expect(replayMonacoEditorMocks.setTheme).toHaveBeenCalledWith("codefight-dark");
  });

  it("updates Monaco theme on rerender and skips theme updates without Monaco instance", () => {
    replayMonacoEditorMocks.useMonaco.mockReturnValue({
      editor: {
        setTheme: replayMonacoEditorMocks.setTheme,
      },
    });

    const { rerender } = render(
      <ReplayMonacoEditor
        language="typescript"
        value="const replay = true;"
        editorTheme="codefight-dark"
        editorOptions={{}}
      />,
    );

    expect(replayMonacoEditorMocks.setTheme).toHaveBeenCalledWith("codefight-dark");

    rerender(
      <ReplayMonacoEditor
        language="typescript"
        value="const replay = true;"
        editorTheme="codefight-light"
        editorOptions={{}}
      />,
    );

    expect(replayMonacoEditorMocks.setTheme).toHaveBeenLastCalledWith("codefight-light");

    replayMonacoEditorMocks.useMonaco.mockReturnValue(null);

    rerender(
      <ReplayMonacoEditor
        language="typescript"
        value="const replay = false;"
        editorTheme="codefight-dark"
        editorOptions={{}}
      />,
    );

    expect(replayMonacoEditorMocks.setTheme).toHaveBeenCalledTimes(2);
  });
});
