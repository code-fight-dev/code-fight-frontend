import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSubmission } from "@/entities/challenge/client";
import {
  pollSubmissionUntilFinal,
  SUBMISSION_POLL_INTERVAL_MS,
  SUBMISSION_POLL_TIMEOUT_MS,
} from "@/features/arena-room/model/submission";
import { createTaskSubmissionFixture } from "./fixtures";

const submissionMocks = vi.hoisted(() => ({
  getSubmission: vi.fn(),
}));

vi.mock("@/entities/challenge/client", () => ({
  getSubmission: submissionMocks.getSubmission,
}));

describe("pollSubmissionUntilFinal", () => {
  beforeEach(() => {
    submissionMocks.getSubmission.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-25T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns immediately for a final initial submission", async () => {
    const initialSubmission = createTaskSubmissionFixture({
      status: "finished",
      verdict: "accepted",
    });
    const onUpdate = vi.fn();
    const setAbortController = vi.fn();

    const result = await pollSubmissionUntilFinal({
      initialSubmission,
      isMounted: () => true,
      onUpdate,
      setAbortController,
    });

    expect(result).toEqual({
      submission: initialSubmission,
      timedOut: false,
    });
    expect(setAbortController).not.toHaveBeenCalled();
    expect(getSubmission).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("polls until final status and emits updates", async () => {
    const runningSubmission = createTaskSubmissionFixture({
      id: "submission-1",
      status: "running",
      passedTests: 2,
      totalTests: 5,
    });
    const finalSubmission = createTaskSubmissionFixture({
      id: "submission-1",
      status: "finished",
      verdict: "accepted",
      passedTests: 5,
      totalTests: 5,
      score: 100,
    });
    submissionMocks.getSubmission
      .mockResolvedValueOnce(runningSubmission)
      .mockResolvedValueOnce(finalSubmission);

    const onUpdate = vi.fn();
    const setAbortController = vi.fn();
    const promise = pollSubmissionUntilFinal({
      initialSubmission: createTaskSubmissionFixture({
        id: "submission-1",
        status: "running",
      }),
      isMounted: () => true,
      onUpdate,
      setAbortController,
    });

    await vi.advanceTimersByTimeAsync(SUBMISSION_POLL_INTERVAL_MS * 2 + 10);
    const result = await promise;

    expect(setAbortController).toHaveBeenCalledTimes(1);
    expect(setAbortController.mock.calls[0]?.[0]).toBeInstanceOf(AbortController);
    expect(getSubmission).toHaveBeenCalledTimes(2);
    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate).toHaveBeenNthCalledWith(1, runningSubmission);
    expect(onUpdate).toHaveBeenNthCalledWith(2, finalSubmission);
    expect(result).toEqual({
      submission: finalSubmission,
      timedOut: false,
    });
  });

  it("returns latest submission with timedOut=true when judge does not finish in time", async () => {
    const latestSubmission = createTaskSubmissionFixture({
      id: "submission-2",
      status: "running",
      passedTests: 3,
      totalTests: 10,
    });
    submissionMocks.getSubmission.mockResolvedValue(latestSubmission);

    const promise = pollSubmissionUntilFinal({
      initialSubmission: createTaskSubmissionFixture({
        id: "submission-2",
        status: "running",
      }),
      isMounted: () => true,
      onUpdate: vi.fn(),
      setAbortController: vi.fn(),
    });

    await vi.advanceTimersByTimeAsync(
      SUBMISSION_POLL_TIMEOUT_MS + SUBMISSION_POLL_INTERVAL_MS,
    );
    const result = await promise;

    expect(result.submission).toEqual(latestSubmission);
    expect(result.timedOut).toBe(true);
    expect(getSubmission).toHaveBeenCalled();
  });

  it("returns latest submission without further updates when component unmounts", async () => {
    const latestSubmission = createTaskSubmissionFixture({
      id: "submission-3",
      status: "running",
    });
    submissionMocks.getSubmission.mockResolvedValue(latestSubmission);

    const onUpdate = vi.fn();
    const promise = pollSubmissionUntilFinal({
      initialSubmission: createTaskSubmissionFixture({
        id: "submission-3",
        status: "running",
      }),
      isMounted: () => false,
      onUpdate,
      setAbortController: vi.fn(),
    });

    await vi.advanceTimersByTimeAsync(SUBMISSION_POLL_INTERVAL_MS + 10);
    const result = await promise;

    expect(result).toEqual({
      submission: latestSubmission,
      timedOut: false,
    });
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("rejects with AbortError when polling is aborted", async () => {
    const setAbortController = vi.fn<(value: AbortController | null) => void>();

    const promise = pollSubmissionUntilFinal({
      initialSubmission: createTaskSubmissionFixture({
        id: "submission-4",
        status: "running",
      }),
      isMounted: () => true,
      onUpdate: vi.fn(),
      setAbortController,
    });

    const controller = setAbortController.mock.calls[0]?.[0];
    controller?.abort();

    await expect(promise).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});
