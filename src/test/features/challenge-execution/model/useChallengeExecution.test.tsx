import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_MS,
} from "@/features/challenge-execution/model/helpers";
import { useChallengeExecution } from "@/features/challenge-execution/model/useChallengeExecution";
import type { UseChallengeExecutionParams } from "@/features/challenge-execution/model/types";
import { createDeferred } from "@/test/helpers/deferred";
import {
  createChallengeExecutionSliceFixture,
  createCodeRunFixture,
  createExecutionHarnessProps,
  createTaskSubmissionFixture,
} from "./fixtures";

const executionMocks = vi.hoisted(() => ({
  createTaskRun: vi.fn(),
  createTaskSubmission: vi.fn(),
  getCodeRun: vi.fn(),
  getSubmission: vi.fn(),
}));

vi.mock("@/entities/challenge/client", () => ({
  createTaskRun: executionMocks.createTaskRun,
  createTaskSubmission: executionMocks.createTaskSubmission,
  getCodeRun: executionMocks.getCodeRun,
  getSubmission: executionMocks.getSubmission,
}));

function ExecutionHarness({
  challenge,
  selectedLanguage,
  sourceCode,
  customInput,
  onOpenConsole,
}: UseChallengeExecutionParams) {
  const model = useChallengeExecution({
    challenge,
    selectedLanguage,
    sourceCode,
    customInput,
    onOpenConsole,
  });

  return (
    <div>
      <span data-testid="status">{model.executionStatus}</span>
      <span data-testid="is-busy">{String(model.isBusy)}</span>
      <pre data-testid="output">{model.outputMessage}</pre>
      <pre data-testid="submissions">{JSON.stringify(model.submissions)}</pre>

      <button type="button" onClick={() => model.handleAction("run")}>
        run
      </button>
      <button type="button" onClick={() => model.handleAction("submit")}>
        submit
      </button>
    </div>
  );
}

function readSubmissionIds() {
  const raw = screen.getByTestId("submissions").textContent ?? "[]";
  const submissions = JSON.parse(raw) as Array<{ id: string }>;
  return submissions.map((submission) => submission.id);
}

describe("useChallengeExecution", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    executionMocks.createTaskRun.mockResolvedValue(
      createCodeRunFixture({
        id: "run-1",
        status: "finished",
        judgeStatus: "finished",
        verdict: "accepted",
        passedTests: 5,
        totalTests: 5,
        runTimeMs: 54,
      }),
    );

    executionMocks.createTaskSubmission.mockResolvedValue(
      createTaskSubmissionFixture({
        id: "submission-1",
        status: "finished",
        judgeStatus: "finished",
        verdict: "accepted",
        passedTests: 5,
        totalTests: 5,
        runTimeMs: 80,
      }),
    );

    executionMocks.getCodeRun.mockResolvedValue(
      createCodeRunFixture({
        id: "run-1",
        status: "finished",
        judgeStatus: "finished",
      }),
    );

    executionMocks.getSubmission.mockResolvedValue(
      createTaskSubmissionFixture({
        id: "submission-1",
        status: "finished",
        judgeStatus: "finished",
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with sorted submission history and default output", () => {
    const props = createExecutionHarnessProps();

    render(<ExecutionHarness {...props} />);

    expect(screen.getByTestId("status")).toHaveTextContent("idle");
    expect(screen.getByTestId("is-busy")).toHaveTextContent("false");
    expect(screen.getByTestId("output")).toHaveTextContent("Choose a testcase");
    expect(readSubmissionIds()).toEqual(["submission-new", "submission-old"]);
  });

  it("syncs submissions when challenge submission history changes", () => {
    const props = createExecutionHarnessProps();
    const { rerender } = render(<ExecutionHarness {...props} />);

    const updatedChallenge = createChallengeExecutionSliceFixture({
      submissionHistory: [
        {
          id: "submission-latest",
          createdAt: "2026-05-27T10:00:00.000Z",
          language: "python",
          status: "finished",
          verdict: "accepted",
          passedTests: 1,
          totalTests: 1,
        },
      ],
    });

    rerender(
      <ExecutionHarness
        {...createExecutionHarnessProps({
          challenge: updatedChallenge,
        })}
      />,
    );

    expect(readSubmissionIds()).toEqual(["submission-latest"]);
  });

  it("shows error when language version is unavailable for selected language", async () => {
    const onOpenConsole = vi.fn();
    const props = createExecutionHarnessProps({
      onOpenConsole,
      challenge: createChallengeExecutionSliceFixture({
        languageVersions: {
          python: "Python 3.12",
        },
      }),
    });

    render(<ExecutionHarness {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "run" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("error");
      expect(screen.getByTestId("output")).toHaveTextContent(
        "Run Code is unavailable for TypeScript.",
      );
      expect(screen.getByTestId("output")).toHaveTextContent(
        "Language version is not configured for this challenge.",
      );
    });

    expect(onOpenConsole).toHaveBeenCalledTimes(1);
    expect(executionMocks.createTaskRun).not.toHaveBeenCalled();
  });

  it("runs code with custom input and marks result as ran", async () => {
    const onOpenConsole = vi.fn();
    const props = createExecutionHarnessProps({
      customInput: "1 2 3",
      onOpenConsole,
    });

    render(<ExecutionHarness {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "run" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("ran");
    });

    expect(executionMocks.createTaskRun).toHaveBeenCalledTimes(1);
    const [taskId, payload] = executionMocks.createTaskRun.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(taskId).toBe("task-1");
    expect(payload).toMatchObject({
      language: "typescript",
      languageVersion: "TypeScript 5.8",
      sourceCode: "function solve() { return 42; }",
      customTestInput: "1 2 3",
    });
    expect(onOpenConsole).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("output")).toHaveTextContent("Custom input: Enabled");
  });

  it("omits customTestInput when custom input is blank", async () => {
    const props = createExecutionHarnessProps({
      customInput: "   ",
    });

    render(<ExecutionHarness {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "run" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("ran");
    });

    const [, payload] = executionMocks.createTaskRun.mock.calls[0] as [string, object];
    expect(payload).not.toHaveProperty("customTestInput");
  });

  it("polls code run until final status", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-25T10:00:00.000Z"));

    executionMocks.createTaskRun.mockResolvedValueOnce(
      createCodeRunFixture({
        id: "run-poll",
        status: "running",
        judgeStatus: "running",
      }),
    );
    executionMocks.getCodeRun
      .mockResolvedValueOnce(
        createCodeRunFixture({
          id: "run-poll",
          status: "running",
          passedTests: 2,
          totalTests: 5,
        }),
      )
      .mockResolvedValueOnce(
        createCodeRunFixture({
          id: "run-poll",
          status: "finished",
          judgeStatus: "finished",
          verdict: "accepted",
          passedTests: 5,
          totalTests: 5,
        }),
      );

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "run" }));
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("status")).toHaveTextContent("running");
    expect(screen.getByTestId("is-busy")).toHaveTextContent("true");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2 + 20);
      await Promise.resolve();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("ran");
    expect(screen.getByTestId("is-busy")).toHaveTextContent("false");
    expect(screen.getByTestId("output")).toHaveTextContent("Run Code status: Finished");

    expect(executionMocks.getCodeRun).toHaveBeenCalledTimes(2);
  }, 15_000);

  it("marks run action as completed with timedOut flag when polling exceeds timeout", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-25T10:00:00.000Z"));

    executionMocks.createTaskRun.mockResolvedValueOnce(
      createCodeRunFixture({
        id: "run-timeout",
        status: "running",
      }),
    );
    executionMocks.getCodeRun.mockResolvedValue(
      createCodeRunFixture({
        id: "run-timeout",
        status: "running",
      }),
    );

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "run" }));
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_TIMEOUT_MS + POLL_INTERVAL_MS + 50);
      await Promise.resolve();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("ran");
    expect(screen.getByTestId("output")).toHaveTextContent(
      "Execution is still processing. Refresh later to see the final status.",
    );

    expect(executionMocks.getCodeRun).toHaveBeenCalled();
  }, 15_000);

  it("submits solution, polls submission and upserts submission history", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-25T10:00:00.000Z"));

    executionMocks.createTaskSubmission.mockResolvedValueOnce(
      createTaskSubmissionFixture({
        id: "submission-live",
        status: "running",
        createdAt: "2026-05-25T10:00:01.000Z",
      }),
    );
    executionMocks.getSubmission.mockResolvedValueOnce(
      createTaskSubmissionFixture({
        id: "submission-live",
        status: "finished",
        verdict: "accepted",
        judgeStatus: "finished",
        passedTests: 5,
        totalTests: 5,
        createdAt: "2026-05-25T10:00:01.000Z",
      }),
    );

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "submit" }));
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("status")).toHaveTextContent("running");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS + 10);
      await Promise.resolve();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("submitted");
    expect(screen.getByTestId("output")).toHaveTextContent("Submit status: Finished");

    const [taskId, payload] = executionMocks.createTaskSubmission.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(taskId).toBe("task-1");
    expect(payload).toMatchObject({
      language: "typescript",
      languageVersion: "TypeScript 5.8",
      sourceCode: "function solve() { return 42; }",
    });
    expect(readSubmissionIds()[0]).toBe("submission-live");
  }, 15_000);

  it("submits already finished submission without polling", async () => {
    executionMocks.createTaskSubmission.mockResolvedValueOnce(
      createTaskSubmissionFixture({
        id: "submission-final",
        status: "finished",
        judgeStatus: "finished",
        verdict: "accepted",
      }),
    );

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("submitted");
      expect(screen.getByTestId("output")).toHaveTextContent("Submit status: Finished");
    });

    expect(executionMocks.getSubmission).not.toHaveBeenCalled();
    expect(readSubmissionIds()[0]).toBe("submission-final");
  });

  it("marks submit action as timed out when latest submission is still running", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-25T10:00:00.000Z"));

    executionMocks.createTaskSubmission.mockResolvedValueOnce(
      createTaskSubmissionFixture({
        id: "submission-timeout",
        status: "running",
      }),
    );
    executionMocks.getSubmission.mockResolvedValue(
      createTaskSubmissionFixture({
        id: "submission-timeout",
        status: "running",
      }),
    );

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "submit" }));
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_TIMEOUT_MS + POLL_INTERVAL_MS + 50);
      await Promise.resolve();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("submitted");
    expect(screen.getByTestId("output")).toHaveTextContent(
      "Execution is still processing. Refresh later to see the final status.",
    );
    expect(executionMocks.getSubmission).toHaveBeenCalled();
  }, 15_000);

  it("treats post-timeout final submission as completed without timeout banner", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-25T10:00:00.000Z"));

    executionMocks.createTaskSubmission.mockResolvedValueOnce(
      createTaskSubmissionFixture({
        id: "submission-late-final",
        status: "running",
      }),
    );

    const pollingIterations = Math.floor(POLL_TIMEOUT_MS / POLL_INTERVAL_MS);
    let getSubmissionCalls = 0;
    executionMocks.getSubmission.mockImplementation(async () => {
      getSubmissionCalls += 1;

      if (getSubmissionCalls <= pollingIterations) {
        return createTaskSubmissionFixture({
          id: "submission-late-final",
          status: "running",
        });
      }

      return createTaskSubmissionFixture({
        id: "submission-late-final",
        status: "finished",
        judgeStatus: "finished",
        verdict: "accepted",
      });
    });

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "submit" }));
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_TIMEOUT_MS + POLL_INTERVAL_MS + 50);
      await Promise.resolve();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("submitted");
    expect(screen.getByTestId("output")).toHaveTextContent("Submit status: Finished");
    expect(screen.getByTestId("output")).not.toHaveTextContent(
      "Execution is still processing. Refresh later to see the final status.",
    );
    expect(getSubmissionCalls).toBeGreaterThanOrEqual(pollingIterations + 1);
  }, 15_000);

  it("treats post-timeout final run as completed without timeout banner", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-25T10:00:00.000Z"));

    executionMocks.createTaskRun.mockResolvedValueOnce(
      createCodeRunFixture({
        id: "run-late-final",
        status: "running",
      }),
    );

    const pollingIterations = Math.floor(POLL_TIMEOUT_MS / POLL_INTERVAL_MS);
    let getCodeRunCalls = 0;
    executionMocks.getCodeRun.mockImplementation(async () => {
      getCodeRunCalls += 1;

      if (getCodeRunCalls <= pollingIterations) {
        return createCodeRunFixture({
          id: "run-late-final",
          status: "running",
        });
      }

      return createCodeRunFixture({
        id: "run-late-final",
        status: "finished",
        judgeStatus: "finished",
        verdict: "accepted",
      });
    });

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "run" }));
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_TIMEOUT_MS + POLL_INTERVAL_MS + 50);
      await Promise.resolve();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("ran");
    expect(screen.getByTestId("output")).toHaveTextContent("Run Code status: Finished");
    expect(screen.getByTestId("output")).not.toHaveTextContent(
      "Execution is still processing. Refresh later to see the final status.",
    );
    expect(getCodeRunCalls).toBeGreaterThanOrEqual(pollingIterations + 1);
  }, 15_000);

  it("ignores new action while execution is already running", async () => {
    const runDeferred = createDeferred<ReturnType<typeof createCodeRunFixture>>();
    executionMocks.createTaskRun.mockImplementationOnce(() => runDeferred.promise);

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "run" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("running");
      expect(screen.getByTestId("is-busy")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    expect(executionMocks.createTaskSubmission).not.toHaveBeenCalled();

    runDeferred.resolve(
      createCodeRunFixture({
        id: "run-deferred",
        status: "finished",
        judgeStatus: "finished",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("ran");
    });
  });

  it("surfaces action failures as error state and readable message", async () => {
    executionMocks.createTaskRun.mockRejectedValueOnce(
      new Error("Judge service unavailable"),
    );

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "run" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("error");
      expect(screen.getByTestId("output")).toHaveTextContent(
        /Run Code failed\.\s+Judge service unavailable/,
      );
      expect(screen.getByTestId("is-busy")).toHaveTextContent("false");
    });
  });

  it("surfaces submit failures with submit action label", async () => {
    executionMocks.createTaskSubmission.mockRejectedValueOnce(new Error("Queue offline"));

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("error");
      expect(screen.getByTestId("output")).toHaveTextContent(
        /Submit failed\.\s+Queue offline/,
      );
    });
  });

  it("ignores abort-shaped errors without switching to error state", async () => {
    executionMocks.createTaskRun.mockRejectedValueOnce({
      name: "AbortError",
    } as unknown);

    render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "run" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("running");
      expect(screen.getByTestId("output")).toHaveTextContent(
        "Waiting for judge queue...",
      );
      expect(screen.getByTestId("output")).not.toHaveTextContent("failed.");
    });
  });

  it("aborts in-flight run request when component unmounts", async () => {
    let receivedSignal: { aborted: boolean } | null = null;
    executionMocks.createTaskRun.mockImplementationOnce((_taskId, _payload, signal) => {
      receivedSignal = signal as { aborted: boolean };

      return new Promise((_resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => {
            reject(new DOMException("Aborted", "AbortError"));
          },
          { once: true },
        );
      });
    });

    const { unmount } = render(<ExecutionHarness {...createExecutionHarnessProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "run" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("running");
    });

    unmount();

    expect(receivedSignal).toEqual(expect.objectContaining({ aborted: true }));
  });
});
