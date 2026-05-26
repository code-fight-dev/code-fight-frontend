import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";

const previewMocks = vi.hoisted(() => ({
  loaderConfig: vi.fn(),
  renderDynamicEditor: vi.fn(),
  setTheme: vi.fn(),
  useMonaco: vi.fn(),
}));

vi.mock("@monaco-editor/react", () => ({
  loader: {
    config: previewMocks.loaderConfig,
  },
  useMonaco: previewMocks.useMonaco,
}));

vi.mock("next/dynamic", () => ({
  default: (
    loaderFactory: unknown,
    options?: {
      loading?: () => unknown;
    },
  ) => {
    if (typeof loaderFactory === "function") {
      void loaderFactory();
    }

    options?.loading?.();

    return (props: Record<string, unknown>) => {
      previewMocks.renderDynamicEditor(props);
      const editorOptions = props.options as { readOnly?: boolean } | undefined;

      return (
        <div
          data-testid="monaco-editor"
          data-language={String(props.language)}
          data-theme={String(props.theme)}
          data-read-only={String(editorOptions?.readOnly)}
        />
      );
    };
  },
}));

vi.mock("monaco-editor", () => ({}));

import { EditorSettingsPreview } from "@/features/preferences/ui/editor-settings/EditorSettingsPreview";

const mutationObserverState: {
  callback: MutationCallback | null;
  disconnect: ReturnType<typeof vi.fn>;
  observe: ReturnType<typeof vi.fn>;
} = {
  callback: null,
  disconnect: vi.fn(),
  observe: vi.fn(),
};

class MockMutationObserver {
  constructor(callback: MutationCallback) {
    mutationObserverState.callback = callback;
  }

  observe = mutationObserverState.observe;
  disconnect = mutationObserverState.disconnect;
}

describe("features/preferences/ui/editor-settings/EditorSettingsPreview", () => {
  beforeEach(() => {
    previewMocks.renderDynamicEditor.mockReset();
    previewMocks.setTheme.mockReset();
    previewMocks.useMonaco.mockReset();

    mutationObserverState.callback = null;
    mutationObserverState.observe.mockReset();
    mutationObserverState.disconnect.mockReset();

    document.documentElement.dataset.theme = "dark";
    vi.stubGlobal("MutationObserver", MockMutationObserver);

    previewMocks.useMonaco.mockReturnValue({
      editor: {
        setTheme: previewMocks.setTheme,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders preview badges and passes read-only options to Monaco editor", () => {
    render(<EditorSettingsPreview preferences={DEFAULT_EDITOR_PREFERENCES} />);

    expect(screen.getByRole("heading", { name: "Live preview" })).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("14px")).toBeInTheDocument();
    expect(screen.getByText("on")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Collapse" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByTestId("monaco-editor")).toHaveAttribute(
      "data-language",
      "typescript",
    );
    expect(screen.getByTestId("monaco-editor")).toHaveAttribute(
      "data-theme",
      "codefight-dark",
    );
    expect(screen.getByTestId("monaco-editor")).toHaveAttribute("data-read-only", "true");

    expect(previewMocks.renderDynamicEditor).toHaveBeenCalled();
    expect(previewMocks.setTheme).toHaveBeenCalledWith("codefight-dark");
    expect(mutationObserverState.observe).toHaveBeenCalledWith(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    act(() => {
      mutationObserverState.callback?.([], {} as MutationObserver);
    });
  });

  it("updates Monaco theme when app theme changes and sync is enabled", async () => {
    const { unmount } = render(
      <EditorSettingsPreview preferences={DEFAULT_EDITOR_PREFERENCES} />,
    );

    document.documentElement.dataset.theme = "light";
    act(() => {
      mutationObserverState.callback?.([], {} as MutationObserver);
    });

    await waitFor(() => {
      expect(screen.getByText("Light")).toBeInTheDocument();
    });
    expect(previewMocks.setTheme).toHaveBeenLastCalledWith("codefight-light");

    unmount();
    expect(mutationObserverState.disconnect).toHaveBeenCalled();
  });

  it("keeps dark Monaco theme when app theme sync is disabled", () => {
    render(
      <EditorSettingsPreview
        preferences={{
          ...DEFAULT_EDITOR_PREFERENCES,
          useAppTheme: false,
        }}
      />,
    );

    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByTestId("monaco-editor")).toHaveAttribute(
      "data-theme",
      "codefight-dark",
    );
    expect(previewMocks.setTheme).toHaveBeenCalledWith("codefight-dark");
  });

  it("toggles preview expansion and skips theme setter without Monaco instance", async () => {
    const user = userEvent.setup();
    previewMocks.useMonaco.mockReturnValueOnce(null);

    render(<EditorSettingsPreview preferences={DEFAULT_EDITOR_PREFERENCES} />);

    expect(previewMocks.setTheme).not.toHaveBeenCalled();

    const collapseButton = screen.getByRole("button", { name: "Collapse" });
    expect(collapseButton).toHaveAttribute("aria-expanded", "true");

    await user.click(collapseButton);
    expect(screen.getByRole("button", { name: "Expand" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
