import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChallengeWorkspaceEditorPanel } from "@/views/challenges/ui/ChallengeWorkspaceEditorPanel";

const editorPanelMocks = vi.hoisted(() => ({
  LanguageSelector: vi.fn(),
  ChallengeWorkspaceActionButton: vi.fn(),
  CodeEditorPanel: vi.fn(),
  ChallengeWorkspaceTabs: vi.fn(),
  TestcasePanel: vi.fn(),
  OutputPanel: vi.fn(),
}));

vi.mock("@/views/challenges/ui/LanguageSelector", () => ({
  LanguageSelector: (props: Record<string, unknown>) => {
    editorPanelMocks.LanguageSelector(props);
    return <div data-testid="language-selector">language</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengeWorkspaceActionButton", () => ({
  ChallengeWorkspaceActionButton: (props: Record<string, unknown>) => {
    editorPanelMocks.ChallengeWorkspaceActionButton(props);
    return (
      <button type="button" onClick={() => (props.onClick as () => void)()}>
        Action {String(props.action)}
      </button>
    );
  },
}));

vi.mock("@/views/challenges/ui/CodeEditorPanel", () => ({
  CodeEditorPanel: (props: Record<string, unknown>) => {
    editorPanelMocks.CodeEditorPanel(props);
    return <div data-testid="code-editor-panel">editor</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengeWorkspaceTabs", () => ({
  ChallengeWorkspaceTabs: (props: Record<string, unknown>) => {
    editorPanelMocks.ChallengeWorkspaceTabs(props);
    return (
      <button
        type="button"
        onClick={() => (props.onTabChange as (tab: string) => void)("console")}
      >
        Switch tab
      </button>
    );
  },
}));

vi.mock("@/views/challenges/ui/TestcasePanel", () => ({
  TestcasePanel: (props: Record<string, unknown>) => {
    editorPanelMocks.TestcasePanel(props);
    return <div data-testid="testcase-panel">testcases</div>;
  },
}));

vi.mock("@/views/challenges/ui/OutputPanel", () => ({
  OutputPanel: (props: Record<string, unknown>) => {
    editorPanelMocks.OutputPanel(props);
    return <div data-testid="output-panel">{String(props.message)}</div>;
  },
}));

describe("views/challenges/ui/ChallengeWorkspaceEditorPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders testcases tab branch and wires language/action/editor handlers", () => {
    const onAction = vi.fn();
    const onWorkspaceTabChange = vi.fn();

    render(
      <ChallengeWorkspaceEditorPanel
        code="const answer = 42;"
        customInput="input"
        executionStatus="idle"
        isBusy={false}
        languages={["typescript", "python"]}
        outputMessage="Ready"
        selectedLanguage="typescript"
        testCases={[
          { name: "Case 1", input: "1", expectedOutput: "2" },
          { name: "Case 2", input: "3", expectedOutput: "4" },
        ]}
        workspaceTab="testcases"
        onAction={onAction}
        onCodeChange={vi.fn()}
        onCustomInputChange={vi.fn()}
        onLanguageChange={vi.fn()}
        onWorkspaceTabChange={onWorkspaceTabChange}
      />,
    );

    expect(screen.getByTestId("language-selector")).toBeInTheDocument();
    expect(screen.getByTestId("code-editor-panel")).toBeInTheDocument();
    expect(screen.getByTestId("testcase-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("output-panel")).not.toBeInTheDocument();

    expect(editorPanelMocks.CodeEditorPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "typescript",
        fileName: "solution.ts",
        value: "const answer = 42;",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Action run" }));
    fireEvent.click(screen.getByRole("button", { name: "Action submit" }));
    expect(onAction).toHaveBeenNthCalledWith(1, "run");
    expect(onAction).toHaveBeenNthCalledWith(2, "submit");

    fireEvent.click(screen.getByRole("button", { name: "Switch tab" }));
    expect(onWorkspaceTabChange).toHaveBeenCalledWith("console");
  });

  it("falls back active testcase index and renders console branch", () => {
    render(
      <ChallengeWorkspaceEditorPanel
        code="print('ok')"
        customInput=""
        executionStatus="error"
        isBusy
        languages={["python"]}
        outputMessage="Compilation failed"
        selectedLanguage="python"
        testCases={[]}
        workspaceTab="console"
        onAction={vi.fn()}
        onCodeChange={vi.fn()}
        onCustomInputChange={vi.fn()}
        onLanguageChange={vi.fn()}
        onWorkspaceTabChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId("output-panel")).toHaveTextContent("Compilation failed");
    expect(screen.queryByTestId("testcase-panel")).not.toBeInTheDocument();

    expect(editorPanelMocks.ChallengeWorkspaceActionButton).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        action: "run",
        disabled: true,
      }),
    );
    expect(editorPanelMocks.ChallengeWorkspaceActionButton).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        action: "submit",
        disabled: true,
      }),
    );
    expect(editorPanelMocks.CodeEditorPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "python",
        fileName: "solution.py",
      }),
    );
  });
});
