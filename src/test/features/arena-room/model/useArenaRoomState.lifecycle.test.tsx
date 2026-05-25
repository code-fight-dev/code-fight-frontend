import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ArenaRoomHarness,
  getArenaRoomMocks,
  requireArenaRoomPollingInput,
  resetUseArenaRoomStateTestState,
  type PollSubmissionMockInput,
} from "./useArenaRoomState.test-helpers";
import {
  createArenaMatchFixture,
  createChallengeFixture,
  createMatchSubmissionFixture,
  createTaskSubmissionFixture,
} from "./fixtures";
import { createDeferred } from "@/test/helpers/deferred";

describe("useArenaRoomState lifecycle", () => {
  beforeEach(() => {
    resetUseArenaRoomStateTestState();
  });

  it("ignores submit action before room becomes ready", async () => {
    const mocks = getArenaRoomMocks();

    render(<ArenaRoomHarness />);
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    expect(mocks.createMatchSubmission).not.toHaveBeenCalled();
    expect(mocks.pollSubmissionUntilFinal).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });
  });

  it("ignores setCurrentCode before initial language is selected", async () => {
    render(<ArenaRoomHarness />);

    expect(screen.getByTestId("selected-language")).toHaveTextContent("none");
    fireEvent.click(screen.getByRole("button", { name: "set-code" }));
    expect(screen.getByTestId("current-code").textContent).toBe("");

    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });
  });

  it("skips refresh when match id is blank", async () => {
    const mocks = getArenaRoomMocks();

    render(<ArenaRoomHarness matchId="   " />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "refresh" }));
    expect(mocks.getMatch).not.toHaveBeenCalled();
  });

  it("tolerates polling refresh failures", async () => {
    const mocks = getArenaRoomMocks();
    mocks.getMatch.mockRejectedValueOnce(new Error("poll failed"));

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    requireArenaRoomPollingInput().onPoll();

    await waitFor(() => {
      expect(mocks.getMatch).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
      expect(screen.getByTestId("error-message")).toHaveTextContent("none");
    });
  });

  it("ignores stale bootstrap success after match id changes", async () => {
    const mocks = getArenaRoomMocks();
    const firstBootstrap = createDeferred<{
      match: ReturnType<typeof createArenaMatchFixture>;
      challenge: ReturnType<typeof createChallengeFixture>;
      initialLanguage: "typescript";
      initialCodeByLanguage: { typescript: string };
    }>();
    const firstMatch = createArenaMatchFixture({ id: "stale-match" });
    const secondMatch = createArenaMatchFixture({ id: "fresh-match" });
    const challenge = createChallengeFixture();

    mocks.bootstrapArenaRoom
      .mockImplementationOnce(() => firstBootstrap.promise)
      .mockResolvedValueOnce({
        match: secondMatch,
        challenge,
        initialLanguage: "typescript",
        initialCodeByLanguage: { typescript: "function solve() {}" },
      });

    const { rerender } = render(<ArenaRoomHarness matchId="match-1" />);
    rerender(<ArenaRoomHarness matchId="match-2" />);

    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
      expect(screen.getByTestId("match-id")).toHaveTextContent("fresh-match");
    });

    firstBootstrap.resolve({
      match: firstMatch,
      challenge,
      initialLanguage: "typescript",
      initialCodeByLanguage: { typescript: "stale code" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("match-id")).toHaveTextContent("fresh-match");
    });
  });

  it("ignores stale bootstrap error after match id changes", async () => {
    const mocks = getArenaRoomMocks();
    const firstBootstrap = createDeferred<{
      match: ReturnType<typeof createArenaMatchFixture>;
      challenge: ReturnType<typeof createChallengeFixture>;
      initialLanguage: "typescript";
      initialCodeByLanguage: { typescript: string };
    }>();
    const secondMatch = createArenaMatchFixture({ id: "fresh-match" });
    const challenge = createChallengeFixture();

    mocks.bootstrapArenaRoom
      .mockImplementationOnce(() => firstBootstrap.promise)
      .mockResolvedValueOnce({
        match: secondMatch,
        challenge,
        initialLanguage: "typescript",
        initialCodeByLanguage: { typescript: "function solve() {}" },
      });

    const { rerender } = render(<ArenaRoomHarness matchId="match-1" />);
    rerender(<ArenaRoomHarness matchId="match-2" />);

    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
      expect(screen.getByTestId("error-message")).toHaveTextContent("none");
    });

    firstBootstrap.reject(new Error("stale bootstrap failure"));

    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
      expect(screen.getByTestId("error-message")).toHaveTextContent("none");
    });
  });

  it("aborts submission polling on unmount", async () => {
    const mocks = getArenaRoomMocks();
    let abortSpy: ReturnType<typeof vi.spyOn> | null = null;
    let isMountedFn: (() => boolean) | null = null;

    mocks.pollSubmissionUntilFinal.mockImplementation(
      ({ isMounted, setAbortController }: PollSubmissionMockInput) => {
        isMountedFn = isMounted;
        const controller = new AbortController();
        abortSpy = vi.spyOn(controller, "abort");
        setAbortController(controller);

        return new Promise((_, reject) => {
          controller.signal.addEventListener(
            "abort",
            () => {
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        });
      },
    );

    const { unmount } = render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mocks.pollSubmissionUntilFinal).toHaveBeenCalledTimes(1);
      expect(isMountedFn?.()).toBe(true);
    });

    unmount();

    await waitFor(() => {
      expect(abortSpy).not.toBeNull();
      expect(abortSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("does not start submission polling when component unmounts before create resolves", async () => {
    const mocks = getArenaRoomMocks();
    const createSubmissionDeferred =
      createDeferred<ReturnType<typeof createMatchSubmissionFixture>>();
    mocks.createMatchSubmission.mockImplementationOnce(
      () => createSubmissionDeferred.promise,
    );

    const { unmount } = render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    unmount();
    createSubmissionDeferred.resolve(
      createMatchSubmissionFixture({ id: "created-after-unmount" }),
    );
    await Promise.resolve();

    expect(mocks.pollSubmissionUntilFinal).not.toHaveBeenCalled();
  });

  it("ignores final submission update when polling resolves after unmount", async () => {
    const mocks = getArenaRoomMocks();
    const pollDeferred = createDeferred<{
      submission: ReturnType<typeof createTaskSubmissionFixture>;
      timedOut: boolean;
    }>();
    mocks.pollSubmissionUntilFinal.mockImplementationOnce(() => pollDeferred.promise);

    const { unmount } = render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mocks.pollSubmissionUntilFinal).toHaveBeenCalledTimes(1);
    });

    unmount();
    pollDeferred.resolve({
      submission: createTaskSubmissionFixture({
        id: "final-after-unmount",
        status: "finished",
      }),
      timedOut: false,
    });
    await Promise.resolve();
  });

  it("prevents duplicate surrender while surrender request is pending", async () => {
    const mocks = getArenaRoomMocks();
    const surrenderDeferred = createDeferred<void>();
    mocks.surrenderMatch.mockImplementationOnce(() => surrenderDeferred.promise);

    render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "surrender" }));

    await waitFor(() => {
      expect(screen.getByTestId("is-surrendering")).toHaveTextContent("true");
      expect(mocks.surrenderMatch).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "surrender" }));
    expect(mocks.surrenderMatch).toHaveBeenCalledTimes(1);

    surrenderDeferred.resolve();

    await waitFor(() => {
      expect(screen.getByTestId("is-surrendering")).toHaveTextContent("false");
    });
  });

  it("does not refresh match when component unmounts before surrender completes", async () => {
    const mocks = getArenaRoomMocks();
    const surrenderDeferred = createDeferred<void>();
    mocks.surrenderMatch.mockImplementationOnce(() => surrenderDeferred.promise);

    const { unmount } = render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "surrender" }));
    unmount();
    surrenderDeferred.resolve();
    await Promise.resolve();

    expect(mocks.getMatch).not.toHaveBeenCalled();
  });

  it("ignores surrender failure when component already unmounted", async () => {
    const mocks = getArenaRoomMocks();
    const surrenderDeferred = createDeferred<void>();
    mocks.surrenderMatch.mockImplementationOnce(() => surrenderDeferred.promise);

    const { unmount } = render(<ArenaRoomHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("load-state")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "surrender" }));
    unmount();
    surrenderDeferred.reject(new Error("surrender failed after unmount"));
    await Promise.resolve();

    expect(mocks.getMatch).not.toHaveBeenCalled();
  });
});
