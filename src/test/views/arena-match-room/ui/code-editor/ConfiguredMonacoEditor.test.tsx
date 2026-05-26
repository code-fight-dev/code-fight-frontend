import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConfiguredMonacoEditor } from "@/views/arena-match-room/ui/code-editor/ConfiguredMonacoEditor";

const monacoEditorMocks = vi.hoisted(() => ({
  useMonaco: vi.fn(),
  dynamicEditor: vi.fn(),
  defineCodeFightMonacoThemes: vi.fn(),
  setTheme: vi.fn(),
}));

vi.mock("@monaco-editor/react", () => ({
  useMonaco: monacoEditorMocks.useMonaco,
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
      monacoEditorMocks.dynamicEditor(props);
      return <div data-testid="dynamic-monaco-editor">dynamic editor</div>;
    };
  },
}));

vi.mock("@/features/preferences/model/editorMonaco", () => ({
  defineCodeFightMonacoThemes: monacoEditorMocks.defineCodeFightMonacoThemes,
}));

function getLastDynamicEditorProps() {
  const lastCall = monacoEditorMocks.dynamicEditor.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("Dynamic Monaco editor was not rendered");
  }

  return lastCall[0] as {
    language: string;
    theme: string;
    value: string;
    beforeMount?: (monacoInstance: unknown) => void;
    onChange?: (value?: string) => void;
    options: Record<string, unknown>;
  };
}

describe("views/arena-match-room/ui/code-editor/ConfiguredMonacoEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dynamic Monaco editor with configured props and forwards onChange", () => {
    monacoEditorMocks.useMonaco.mockReturnValue({
      editor: {
        setTheme: monacoEditorMocks.setTheme,
      },
    });

    const onChange = vi.fn();

    render(
      <ConfiguredMonacoEditor
        language="typescript"
        value="const a = 1;"
        editorTheme="codefight-dark"
        editorOptions={{ fontSize: 14, readOnly: false }}
        onChange={onChange}
      />,
    );

    const editorProps = getLastDynamicEditorProps();

    expect(editorProps.language).toBe("typescript");
    expect(editorProps.theme).toBe("codefight-dark");
    expect(editorProps.value).toBe("const a = 1;");
    expect(editorProps.options).toMatchObject({ fontSize: 14, readOnly: false });

    editorProps.beforeMount?.({ editor: {} });
    expect(monacoEditorMocks.defineCodeFightMonacoThemes).toHaveBeenCalledTimes(1);

    editorProps.onChange?.("next code");
    editorProps.onChange?.(undefined);

    expect(onChange).toHaveBeenNthCalledWith(1, "next code");
    expect(onChange).toHaveBeenNthCalledWith(2, "");
    expect(monacoEditorMocks.setTheme).toHaveBeenCalledWith("codefight-dark");
  });

  it("updates Monaco theme on rerender and skips theme updates without Monaco instance", () => {
    monacoEditorMocks.useMonaco.mockReturnValue({
      editor: {
        setTheme: monacoEditorMocks.setTheme,
      },
    });

    const { rerender } = render(
      <ConfiguredMonacoEditor
        language="typescript"
        value="const a = 1;"
        editorTheme="codefight-dark"
        editorOptions={{}}
        onChange={vi.fn()}
      />,
    );

    expect(monacoEditorMocks.setTheme).toHaveBeenCalledWith("codefight-dark");

    rerender(
      <ConfiguredMonacoEditor
        language="typescript"
        value="const a = 1;"
        editorTheme="codefight-light"
        editorOptions={{}}
        onChange={vi.fn()}
      />,
    );

    expect(monacoEditorMocks.setTheme).toHaveBeenLastCalledWith("codefight-light");

    monacoEditorMocks.useMonaco.mockReturnValue(null);

    act(() => {
      rerender(
        <ConfiguredMonacoEditor
          language="typescript"
          value="const a = 2;"
          editorTheme="codefight-dark"
          editorOptions={{}}
          onChange={vi.fn()}
        />,
      );
    });

    expect(monacoEditorMocks.setTheme).toHaveBeenCalledTimes(2);
  });
});
