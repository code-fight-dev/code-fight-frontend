import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  ArenaRoomHarness,
  getArenaRoomMocks,
  resetUseArenaRoomStateTestState,
  type PollSubmissionMockInput,
} from "./useArenaRoomState.test-helpers";
import {
  createArenaMatchFixture,
  createChallengeFixture,
  createTaskSubmissionFixture,
} from "./fixtures";

describe("useArenaRoomState actions", () => {
  beforeEach(() => {
    resetUseArenaRoomStateTestState();
  });

  it("shows bootstrap error message when initial load fails", async () => {
    const mocks = getArenaRoomMocks();
    mocks.bootstrapArenaRoom.mockRejectedValue(new Error("Bootstrap failed"));

    render(<ArenaRoomHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent("Bootstrap failed");
    });
  });

  it("blocks submissions when match is not running", async () => {
    const mocks = getArenaRoomMocks();
    mocks.bootstrapArenaRoom.mockResolvedValue({
      match: createArenaMatchFixture({ status: "finished" }),
      challenge: createChallengeFixture(),
      initialLanguage: "typescript",
      initialCodeByLanguage: {
        typescript: "function solve() {}",
      },
    });

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("submission-status")).toHaveTextContent("error");
      expect(screen.getByTestId("output-message")).toHaveTextContent(
        "Match is no longer running, submission is disabled.",
      );
    });
  });

  it("blocks submissions when language version is missing", async () => {
    const mocks = getArenaRoomMocks();
    mocks.bootstrapArenaRoom.mockResolvedValue({
      match: createArenaMatchFixture({ status: "running" }),
      challenge: createChallengeFixture({
        languageVersions: {},
      }),
      initialLanguage: "typescript",
      initialCodeByLanguage: {
        typescript: "function solve() {}",
      },
    });

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("submission-status")).toHaveTextContent("error");
      expect(screen.getByTestId("output-message")).toHaveTextContent(
        "Language version is not configured for typescript.",
      );
    });
  });

  it("submits solution, polls to final status and switches to console tab", async () => {
    const mocks = getArenaRoomMocks();
    const finalSubmission = createTaskSubmissionFixture({
      id: "created-submission-1",
      status: "finished",
      verdict: "accepted",
      passedTests: 5,
      totalTests: 5,
      score: 100,
      runTimeMs: 200,
    });

    mocks.pollSubmissionUntilFinal.mockImplementation(
      async ({ onUpdate }: PollSubmissionMockInput) => {
        onUpdate(
          createTaskSubmissionFixture({
            id: "created-submission-1",
            status: "running",
            passedTests: 3,
            totalTests: 5,
          }),
        );
        return {
          submission: finalSubmission,
          timedOut: true,
        };
      },
    );

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mocks.createMatchSubmission).toHaveBeenCalledWith("match-1", {
        language: "typescript",
        languageVersion: "TypeScript 5.8",
        sourceCode: "function solve() {}",
      });
      expect(screen.getByTestId("active-tab")).toHaveTextContent("console");
      expect(screen.getByTestId("submission-status")).toHaveTextContent("submitted");
      expect(screen.getByTestId("own-submission-id")).toHaveTextContent(
        "created-submission-1",
      );
      expect(screen.getByTestId("output-message")).toHaveTextContent(
        "Judge is taking longer than expected.",
      );
    });
  });

  it("shows fallback submission failure message for non-Error exceptions", async () => {
    const mocks = getArenaRoomMocks();
    mocks.createMatchSubmission.mockRejectedValue("boom");

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("submission-status")).toHaveTextContent("error");
      expect(screen.getByTestId("output-message")).toHaveTextContent("Submission failed");
    });
  });

  it("blocks surrender when match is not running", async () => {
    const mocks = getArenaRoomMocks();
    mocks.bootstrapArenaRoom.mockResolvedValue({
      match: createArenaMatchFixture({ status: "finished" }),
      challenge: createChallengeFixture(),
      initialLanguage: "typescript",
      initialCodeByLanguage: {
        typescript: "function solve() {}",
      },
    });

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "surrender" }));

    await waitFor(() => {
      expect(screen.getByTestId("output-message")).toHaveTextContent(
        "Match is no longer running, surrender is disabled.",
      );
    });
  });

  it("surrenders and refreshes match", async () => {
    const mocks = getArenaRoomMocks();
    mocks.getMatch.mockResolvedValue(createArenaMatchFixture({ status: "finished" }));

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "surrender" }));

    await waitFor(() => {
      expect(mocks.surrenderMatch).toHaveBeenCalledWith("match-1");
      expect(mocks.getMatch).toHaveBeenCalledWith("match-1");
      expect(screen.getByTestId("is-surrendering")).toHaveTextContent("false");
      expect(screen.getByTestId("output-message")).toHaveTextContent(
        "You surrendered. Waiting for the final match snapshot...",
      );
    });
  });

  it("shows fallback surrender message for non-Error exceptions", async () => {
    const mocks = getArenaRoomMocks();
    mocks.surrenderMatch.mockRejectedValue("boom");

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "surrender" }));

    await waitFor(() => {
      expect(screen.getByTestId("output-message")).toHaveTextContent(
        "Failed to surrender match",
      );
      expect(screen.getByTestId("is-surrendering")).toHaveTextContent("false");
    });
  });
});
