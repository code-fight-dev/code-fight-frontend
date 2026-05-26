import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ArenaRoomWorkspaceShell } from "@/views/arena-match-room/ui/ArenaRoomWorkspaceShell";
import { createChallengeFixture } from "@/test/fixtures/challenge";
import { createTaskSubmissionFixture } from "@/test/features/arena-room/model/fixtures";

const workspaceMocks = vi.hoisted(() => ({
  ArenaCodeEditorPanel: vi.fn(),
  ArenaRoomTestcasePanel: vi.fn(),
  ArenaRoomConsolePanel: vi.fn(),
}));

vi.mock("@/views/arena-match-room/ui/ArenaCodeEditorPanel", () => ({
  ArenaCodeEditorPanel: (props: Record<string, unknown>) => {
    workspaceMocks.ArenaCodeEditorPanel(props);
    return <div data-testid="arena-code-editor-panel">editor</div>;
  },
}));

vi.mock("@/views/arena-match-room/ui/ArenaRoomTestcasePanel", () => ({
  ArenaRoomTestcasePanel: (props: Record<string, unknown>) => {
    workspaceMocks.ArenaRoomTestcasePanel(props);
    return <div data-testid="arena-room-testcase-panel">testcases</div>;
  },
}));

vi.mock("@/views/arena-match-room/ui/ArenaRoomConsolePanel", () => ({
  ArenaRoomConsolePanel: (props: Record<string, unknown>) => {
    workspaceMocks.ArenaRoomConsolePanel(props);
    return <div data-testid="arena-room-console-panel">console</div>;
  },
}));

vi.mock("@/shared/ui/Select", () => ({
  Select: ({
    value,
    options,
    onValueChange,
    ...rest
  }: {
    value: string;
    options: Array<{ value: string; label: string }>;
    onValueChange: (value: string) => void;
    [key: string]: unknown;
  }) => (
    <select
      {...rest}
      data-testid="workspace-language-select"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

type Props = ComponentProps<typeof ArenaRoomWorkspaceShell>;

function renderWorkspace(overrides: Partial<Props> = {}) {
  const props: Props = {
    challenge: createChallengeFixture({
      supportedLanguages: ["typescript", "python"],
      testCases: [
        {
          name: "Case A",
          input: "1",
          expectedOutput: "1",
        },
      ],
    }),
    selectedLanguage: "typescript",
    currentCode: "function solve() {}",
    submissionStatus: "idle",
    outputMessage: "Ready",
    activeWorkspaceTab: "testcases",
    ownSubmission: null,
    isSubmitting: false,
    setActiveWorkspaceTab: vi.fn(),
    setSelectedLanguage: vi.fn(),
    setCurrentCode: vi.fn(),
    submitSolution: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  const result = render(<ArenaRoomWorkspaceShell {...props} />);

  return {
    ...result,
    props,
  };
}

describe("views/arena-match-room/ui/ArenaRoomWorkspaceShell", () => {
  it("renders language selector, editor panel and testcase panel", () => {
    const { props } = renderWorkspace();

    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-language-select")).toHaveValue("typescript");
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
    expect(screen.getByTestId("arena-code-editor-panel")).toBeInTheDocument();
    expect(screen.getByTestId("arena-room-testcase-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("arena-room-console-panel")).not.toBeInTheDocument();

    expect(workspaceMocks.ArenaCodeEditorPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "typescript",
        value: "function solve() {}",
        fileName: "solution.ts",
        onChange: props.setCurrentCode,
      }),
    );

    expect(workspaceMocks.ArenaRoomTestcasePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge: props.challenge,
        activeWorkspaceTab: "testcases",
        activeTestcaseIndex: 0,
      }),
    );

    fireEvent.change(screen.getByTestId("workspace-language-select"), {
      target: { value: "python" },
    });

    expect(props.setSelectedLanguage).toHaveBeenCalledWith("python");

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(props.submitSolution).toHaveBeenCalledTimes(1);
  });

  it("renders console branch and forwards console props", () => {
    const ownSubmission = createTaskSubmissionFixture({
      id: "submission-2",
      status: "running",
    });
    const { props } = renderWorkspace({
      activeWorkspaceTab: "console",
      isSubmitting: true,
      submissionStatus: "running",
      outputMessage: "Running tests...",
      ownSubmission,
    });

    expect(screen.getByTestId("arena-room-console-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("arena-room-testcase-panel")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    expect(workspaceMocks.ArenaRoomConsolePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        isSubmitting: true,
        ownSubmission,
        outputMessage: "Running tests...",
        submissionStatus: "running",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Console" }));
    fireEvent.click(screen.getByRole("button", { name: "Testcases" }));
    expect(props.setActiveWorkspaceTab).toHaveBeenNthCalledWith(1, "console");
    expect(props.setActiveWorkspaceTab).toHaveBeenNthCalledWith(2, "testcases");
  });
});
