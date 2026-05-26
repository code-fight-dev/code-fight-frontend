import { act, renderHook } from "@testing-library/react";
import type { CSSProperties } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UseChallengeExecutionParams } from "@/features/challenge-execution";
import { createChallengeFixture } from "@/test/fixtures/challenge";
import { useChallengeWorkspaceState } from "@/views/challenges/model/useChallengeWorkspaceState";

const workspaceStateMocks = vi.hoisted(() => ({
  useChallengeExecution: vi.fn(),
  handleAction: vi.fn(),
}));

vi.mock("@/features/challenge-execution", () => ({
  useChallengeExecution: workspaceStateMocks.useChallengeExecution,
}));

type WorkspaceStyle = CSSProperties & {
  "--challenge-left-panel"?: string;
};

function getWorkspaceWidth(result: { current: { workspaceStyle: WorkspaceStyle } }) {
  return result.current.workspaceStyle["--challenge-left-panel"];
}

describe("views/challenges/model/useChallengeWorkspaceState", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    workspaceStateMocks.useChallengeExecution.mockImplementation(
      (params: UseChallengeExecutionParams) => ({
        executionStatus: "idle",
        outputMessage: "Ready",
        isBusy: false,
        submissions: [],
        handleAction: workspaceStateMocks.handleAction,
        __params: params,
      }),
    );
  });

  it("initializes workspace state and forwards challenge execution params", () => {
    const challenge = createChallengeFixture({
      supportedLanguages: ["typescript", "python"],
      starterCodeByLanguage: {
        typescript: "function solveTs() {}",
        python: "def solve_py():\n    pass",
      },
      submissionHistory: [
        {
          id: "submission-1",
          createdAt: "2026-05-24T10:00:00.000Z",
          language: "typescript",
          status: "finished",
          passedTests: 3,
          totalTests: 3,
        },
      ],
    });

    const { result } = renderHook(() => useChallengeWorkspaceState(challenge));

    expect(result.current.selectedLanguage).toBe("typescript");
    expect(result.current.currentCode).toBe("function solveTs() {}");
    expect(result.current.problemTab).toBe("description");
    expect(result.current.workspaceTab).toBe("testcases");
    expect(result.current.executionStatus).toBe("idle");
    expect(result.current.outputMessage).toBe("Ready");
    expect(getWorkspaceWidth(result)).toBe("43%");

    expect(workspaceStateMocks.useChallengeExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge: {
          taskId: challenge.taskId,
          languageVersions: challenge.languageVersions,
          submissionHistory: challenge.submissionHistory,
        },
        selectedLanguage: "typescript",
        sourceCode: "function solveTs() {}",
        customInput: "",
        onOpenConsole: expect.any(Function),
      }),
    );
  });

  it("falls back current code to empty string when starter code is missing", () => {
    const challenge = createChallengeFixture({
      supportedLanguages: ["typescript", "python"],
      starterCodeByLanguage: {
        python: "print('py')",
      },
    });

    const { result } = renderHook(() => useChallengeWorkspaceState(challenge));

    expect(result.current.selectedLanguage).toBe("typescript");
    expect(result.current.currentCode).toBe("");
  });

  it("updates language/code and opens console through execution callback", () => {
    const challenge = createChallengeFixture({
      supportedLanguages: ["python", "java"],
      starterCodeByLanguage: {
        python: "print('py')",
      },
    });

    const paramsRef: { value: UseChallengeExecutionParams | null } = { value: null };
    workspaceStateMocks.useChallengeExecution.mockImplementation(
      (params: UseChallengeExecutionParams) => {
        paramsRef.value = params;
        return {
          executionStatus: "ran",
          outputMessage: "Done",
          isBusy: false,
          submissions: [],
          handleAction: workspaceStateMocks.handleAction,
        };
      },
    );

    const { result } = renderHook(() => useChallengeWorkspaceState(challenge));

    expect(result.current.selectedLanguage).toBe("python");
    expect(result.current.currentCode).toBe("print('py')");

    act(() => {
      result.current.handleLanguageChange("java");
    });

    expect(result.current.selectedLanguage).toBe("java");
    expect(result.current.currentCode).toBe("");

    act(() => {
      result.current.handleCodeChange("class Main {}");
    });

    expect(result.current.currentCode).toBe("class Main {}");

    act(() => {
      result.current.handleLanguageChange("python");
      result.current.handleLanguageChange("java");
    });

    expect(result.current.currentCode).toBe("class Main {}");

    act(() => {
      paramsRef.value?.onOpenConsole();
    });

    expect(result.current.workspaceTab).toBe("console");
  });

  it("resizes workspace panels with clamp boundaries and restores body styles", () => {
    const challenge = createChallengeFixture();
    const { result } = renderHook(() => useChallengeWorkspaceState(challenge));

    const shell = document.createElement("div");
    Object.defineProperty(shell, "getBoundingClientRect", {
      value: () => ({
        left: 100,
        width: 200,
      }),
    });

    act(() => {
      result.current.shellRef.current = shell;
    });

    const preventDefault = vi.fn();

    act(() => {
      result.current.handleResizeStart({
        preventDefault,
      } as unknown as Parameters<typeof result.current.handleResizeStart>[0]);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(document.body.style.cursor).toBe("col-resize");
    expect(document.body.style.userSelect).toBe("none");

    act(() => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 0 }));
    });
    expect(getWorkspaceWidth(result)).toBe("34%");

    act(() => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 500 }));
    });
    expect(getWorkspaceWidth(result)).toBe("58%");

    act(() => {
      window.dispatchEvent(new MouseEvent("pointerup"));
    });

    expect(document.body.style.cursor).toBe("");
    expect(document.body.style.userSelect).toBe("");
  });

  it("ignores pointer move updates when shell ref is missing", () => {
    const challenge = createChallengeFixture();
    const { result } = renderHook(() => useChallengeWorkspaceState(challenge));

    act(() => {
      result.current.handleResizeStart({
        preventDefault: vi.fn(),
      } as unknown as Parameters<typeof result.current.handleResizeStart>[0]);
    });

    act(() => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 0 }));
      window.dispatchEvent(new MouseEvent("pointerup"));
    });

    expect(getWorkspaceWidth(result)).toBe("43%");
  });
});
