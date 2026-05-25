import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  createMatch,
  getArenaMocks,
  MatchmakingHarness,
  resetUseArenaMatchmakingTestState,
} from "./useArenaMatchmaking.test-helpers";

const arenaMocks = getArenaMocks();

describe("useArenaMatchmaking errors", () => {
  beforeEach(() => {
    resetUseArenaMatchmakingTestState();
  });

  it("uses fallback sync error message for non-Error rejection", async () => {
    arenaMocks.getCurrentMatch.mockRejectedValueOnce("sync failed");

    render(<MatchmakingHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to sync match",
      );
    });
  });

  it("surfaces action and sync errors in error state", async () => {
    arenaMocks.getCurrentMatch.mockRejectedValueOnce(new Error("sync failed"));
    arenaMocks.joinMatchmakingQueue.mockRejectedValueOnce(new Error("queue failed"));

    render(<MatchmakingHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent("sync failed");
    });

    fireEvent.click(screen.getByRole("button", { name: "start" }));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent("queue failed");
    });
  });

  it("uses fallback start error message for non-Error rejection", async () => {
    arenaMocks.joinMatchmakingQueue.mockRejectedValueOnce("queue failed");

    render(<MatchmakingHarness />);
    fireEvent.click(screen.getByRole("button", { name: "start" }));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to start matchmaking",
      );
    });
  });

  it("surfaces cancel error message from Error instance", async () => {
    arenaMocks.cancelMatchmakingQueue.mockRejectedValueOnce(new Error("cancel failed"));

    render(<MatchmakingHarness />);
    fireEvent.click(screen.getByRole("button", { name: "cancel" }));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent("cancel failed");
    });
  });

  it("uses fallback cancel error message for non-Error rejection", async () => {
    arenaMocks.cancelMatchmakingQueue.mockRejectedValueOnce("cancel failed");

    render(<MatchmakingHarness />);
    fireEvent.click(screen.getByRole("button", { name: "cancel" }));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to cancel queue",
      );
    });
  });

  it("surfaces accept error message from Error instance", async () => {
    arenaMocks.getCurrentMatch.mockResolvedValueOnce({
      match: createMatch({
        status: "pending",
      }),
    });
    arenaMocks.acceptMatchmakingMatch.mockRejectedValueOnce(new Error("accept failed"));

    render(<MatchmakingHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("pending_accept");
    });

    fireEvent.click(screen.getByRole("button", { name: "accept" }));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent("accept failed");
    });
  });

  it("uses fallback accept error message for non-Error rejection", async () => {
    arenaMocks.getCurrentMatch.mockResolvedValueOnce({
      match: createMatch({
        status: "pending",
      }),
    });
    arenaMocks.acceptMatchmakingMatch.mockRejectedValueOnce("accept failed");

    render(<MatchmakingHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("pending_accept");
    });

    fireEvent.click(screen.getByRole("button", { name: "accept" }));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to accept match",
      );
    });
  });
});
