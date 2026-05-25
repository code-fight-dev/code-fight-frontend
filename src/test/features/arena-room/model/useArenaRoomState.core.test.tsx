import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  ArenaRoomHarness,
  getArenaRoomMocks,
  requireArenaRoomPollingInput,
  requireArenaRoomRealtimeInput,
  resetUseArenaRoomStateTestState,
} from "./useArenaRoomState.test-helpers";
import { createArenaMatchFixture } from "./fixtures";

describe("useArenaRoomState core", () => {
  beforeEach(() => {
    resetUseArenaRoomStateTestState();
  });

  it("shows auth error for guests and skips bootstrap", async () => {
    const mocks = getArenaRoomMocks();
    mocks.useViewerSession.mockReturnValue({
      viewer: null,
    });

    render(<ArenaRoomHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("error");
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "You need to sign in to enter arena match rooms.",
      );
    });

    expect(mocks.bootstrapArenaRoom).not.toHaveBeenCalled();
  });

  it("bootstraps ready state with initial language, code and perspective", async () => {
    render(<ArenaRoomHarness matchId=" match-1 " />);

    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    expect(screen.getByTestId("viewer-id")).toHaveTextContent("viewer-1");
    expect(screen.getByTestId("selected-language")).toHaveTextContent("typescript");
    expect(screen.getByTestId("current-code")).toHaveTextContent("function solve() {}");
    expect(screen.getByTestId("self-score")).toHaveTextContent("0");
    expect(screen.getByTestId("opponent-score")).toHaveTextContent("0");

    const realtimeInput = requireArenaRoomRealtimeInput();
    const pollingInput = requireArenaRoomPollingInput();

    expect(realtimeInput.viewerId).toBe("viewer-1");
    expect(realtimeInput.matchId).toBe(" match-1 ");
    expect(pollingInput.enabled).toBe(true);
  });

  it("updates code per selected language and keeps language-specific drafts", async () => {
    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "set-code" }));
    expect(screen.getByTestId("current-code")).toHaveTextContent("TS code");

    fireEvent.click(screen.getByRole("button", { name: "set-python" }));
    expect(screen.getByTestId("current-code")).toHaveTextContent(/def solve\(\):\s*pass/);

    fireEvent.click(screen.getByRole("button", { name: "set-code-alt" }));
    expect(screen.getByTestId("current-code")).toHaveTextContent("PY code");

    fireEvent.click(screen.getByRole("button", { name: "set-typescript" }));
    expect(screen.getByTestId("current-code")).toHaveTextContent("TS code");
  });

  it("applies finished realtime snapshot and appends finish message only once", async () => {
    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    const realtimeInput = requireArenaRoomRealtimeInput();
    const finishedMatch = createArenaMatchFixture({
      status: "finished",
      updatedAt: "2026-05-25T00:10:00.000Z",
    });

    realtimeInput.onMatchSnapshot(finishedMatch);
    await waitFor(() => {
      expect(screen.getByTestId("match-status")).toHaveTextContent("finished");
      expect(screen.getByTestId("output-message")).toHaveTextContent(
        "Match finished. Final score is locked.",
      );
    });

    realtimeInput.onMatchSnapshot(finishedMatch);
    const output = screen.getByTestId("output-message").textContent ?? "";
    const occurrences = output.split("Match finished. Final score is locked.").length - 1;
    expect(occurrences).toBe(1);
  });

  it("refreshes match with normalized id", async () => {
    const mocks = getArenaRoomMocks();
    mocks.getMatch.mockResolvedValue(
      createArenaMatchFixture({
        id: "match-1",
        player1Score: 11,
      }),
    );

    render(<ArenaRoomHarness matchId=" match-1 " />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "refresh" }));

    await waitFor(() => {
      expect(mocks.getMatch).toHaveBeenCalledWith("match-1");
    });
  });
});
