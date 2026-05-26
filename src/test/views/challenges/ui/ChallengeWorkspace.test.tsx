import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createChallengeFixture } from "@/test/fixtures/challenge";
import { ChallengeWorkspace } from "@/views/challenges/ui/ChallengeWorkspace";

const workspaceViewMocks = vi.hoisted(() => ({
  useChallengeWorkspaceState: vi.fn(),
  ChallengeProblemPanel: vi.fn(),
  ChallengeWorkspaceResizeHandle: vi.fn(),
  ChallengeWorkspaceEditorPanel: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/views/challenges/model/useChallengeWorkspaceState", () => ({
  useChallengeWorkspaceState: workspaceViewMocks.useChallengeWorkspaceState,
}));

vi.mock("@/views/challenges/ui/ChallengeProblemPanel", () => ({
  ChallengeProblemPanel: (props: Record<string, unknown>) => {
    workspaceViewMocks.ChallengeProblemPanel(props);
    return <div data-testid="problem-panel">problem</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengeWorkspaceResizeHandle", () => ({
  ChallengeWorkspaceResizeHandle: (props: Record<string, unknown>) => {
    workspaceViewMocks.ChallengeWorkspaceResizeHandle(props);
    return <div data-testid="resize-handle">resize</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengeWorkspaceEditorPanel", () => ({
  ChallengeWorkspaceEditorPanel: (props: Record<string, unknown>) => {
    workspaceViewMocks.ChallengeWorkspaceEditorPanel(props);
    return <div data-testid="workspace-editor-panel">editor</div>;
  },
}));

describe("views/challenges/ui/ChallengeWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders workspace shell and forwards state to child panels", () => {
    const challenge = createChallengeFixture({
      acceptanceRate: 52.4,
      attempts: 1200,
      testCases: [{ name: "Case 1", input: "1", expectedOutput: "2" }],
    });

    const shellRef = { current: null };
    const setProblemTab = vi.fn();
    const setWorkspaceTab = vi.fn();
    const setCustomInput = vi.fn();
    const handleAction = vi.fn();
    const handleCodeChange = vi.fn();
    const handleLanguageChange = vi.fn();
    const handleResizeStart = vi.fn();

    workspaceViewMocks.useChallengeWorkspaceState.mockReturnValue({
      currentCode: "function solve() {}",
      customInput: "10",
      executionStatus: "idle",
      handleAction,
      handleCodeChange,
      handleLanguageChange,
      handleResizeStart,
      isBusy: false,
      outputMessage: "Ready",
      problemTab: "description",
      selectedLanguage: "typescript",
      setCustomInput,
      setProblemTab,
      setWorkspaceTab,
      shellRef,
      submissions: [],
      workspaceStyle: { "--challenge-left-panel": "43%" },
      workspaceTab: "testcases",
    });

    render(<ChallengeWorkspace challenge={challenge} />);

    expect(screen.getByRole("link", { name: "All challenges" })).toHaveAttribute(
      "href",
      "/challenges",
    );
    expect(screen.getByText("52.4% accepted")).toBeInTheDocument();
    expect(
      screen.getByText(
        (text) => text.includes("1") && text.includes("200") && text.includes("attempts"),
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("problem-panel")).toBeInTheDocument();
    expect(screen.getByTestId("resize-handle")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-editor-panel")).toBeInTheDocument();

    expect(workspaceViewMocks.useChallengeWorkspaceState).toHaveBeenCalledWith(challenge);
    expect(workspaceViewMocks.ChallengeProblemPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge,
        activeTab: "description",
        submissions: [],
        onTabChange: setProblemTab,
      }),
    );
    expect(workspaceViewMocks.ChallengeWorkspaceResizeHandle).toHaveBeenCalledWith(
      expect.objectContaining({
        onResizeStart: handleResizeStart,
      }),
    );
    expect(workspaceViewMocks.ChallengeWorkspaceEditorPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "function solve() {}",
        customInput: "10",
        executionStatus: "idle",
        isBusy: false,
        languages: challenge.supportedLanguages,
        outputMessage: "Ready",
        selectedLanguage: "typescript",
        testCases: challenge.testCases,
        workspaceTab: "testcases",
        onAction: handleAction,
        onCodeChange: handleCodeChange,
        onCustomInputChange: setCustomInput,
        onLanguageChange: handleLanguageChange,
        onWorkspaceTabChange: setWorkspaceTab,
      }),
    );
  });
});
