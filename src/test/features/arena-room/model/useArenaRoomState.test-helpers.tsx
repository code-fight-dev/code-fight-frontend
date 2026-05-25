import { vi } from "vitest";

import { useArenaRoomState } from "@/features/arena-room/model/useArenaRoomState";
import type { Match } from "@/entities/match";
import type { TaskSubmission } from "@/entities/challenge";
import {
  createArenaMatchFixture,
  createChallengeFixture,
  createMatchSubmissionFixture,
  createTaskSubmissionFixture,
  createViewerFixture,
} from "./fixtures";

const arenaRoomMocks = vi.hoisted(() => ({
  useViewerSession: vi.fn(),
  createMatchSubmission: vi.fn(),
  getMatch: vi.fn(),
  surrenderMatch: vi.fn(),
  bootstrapArenaRoom: vi.fn(),
  useArenaRoomRealtime: vi.fn(),
  useArenaRoomPolling: vi.fn(),
  pollSubmissionUntilFinal: vi.fn(),
}));

vi.mock("@/entities/viewer", () => ({
  useViewerSession: arenaRoomMocks.useViewerSession,
}));

vi.mock("@/entities/match/client", () => ({
  createMatchSubmission: arenaRoomMocks.createMatchSubmission,
  getMatch: arenaRoomMocks.getMatch,
  surrenderMatch: arenaRoomMocks.surrenderMatch,
}));

vi.mock("@/features/arena-room/model/bootstrap", () => ({
  bootstrapArenaRoom: arenaRoomMocks.bootstrapArenaRoom,
}));

vi.mock("@/features/arena-room/model/realtime", () => ({
  useArenaRoomRealtime: arenaRoomMocks.useArenaRoomRealtime,
  useArenaRoomPolling: arenaRoomMocks.useArenaRoomPolling,
}));

vi.mock("@/features/arena-room/model/submission", () => ({
  pollSubmissionUntilFinal: arenaRoomMocks.pollSubmissionUntilFinal,
}));

export function getArenaRoomMocks() {
  return arenaRoomMocks;
}

type RealtimeInput = {
  viewerId: string | null;
  matchId: string;
  onMatchSnapshot: (match: Match) => void;
};

type PollingInput = {
  enabled: boolean;
  onPoll: () => void;
};

let latestRealtimeInput: RealtimeInput | null = null;
let latestPollingInput: PollingInput | null = null;

export function requireArenaRoomRealtimeInput() {
  if (!latestRealtimeInput) {
    throw new Error("Expected useArenaRoomRealtime input");
  }

  return latestRealtimeInput;
}

export function requireArenaRoomPollingInput() {
  if (!latestPollingInput) {
    throw new Error("Expected useArenaRoomPolling input");
  }

  return latestPollingInput;
}

export function resetUseArenaRoomStateTestState() {
  latestRealtimeInput = null;
  latestPollingInput = null;
  vi.resetAllMocks();

  const viewer = createViewerFixture();
  const match = createArenaMatchFixture();
  const challenge = createChallengeFixture();
  const createdSubmission = createMatchSubmissionFixture({
    id: "created-submission-1",
    status: "running",
  });
  const finalSubmission = createTaskSubmissionFixture({
    id: "created-submission-1",
    status: "finished",
    verdict: "accepted",
    passedTests: 5,
    totalTests: 5,
    score: 100,
  });

  arenaRoomMocks.useViewerSession.mockReturnValue({
    viewer,
  });
  arenaRoomMocks.bootstrapArenaRoom.mockResolvedValue({
    match,
    challenge,
    initialLanguage: "typescript",
    initialCodeByLanguage: { ...challenge.starterCodeByLanguage },
  });
  arenaRoomMocks.createMatchSubmission.mockResolvedValue(createdSubmission);
  arenaRoomMocks.pollSubmissionUntilFinal.mockResolvedValue({
    submission: finalSubmission,
    timedOut: false,
  });
  arenaRoomMocks.surrenderMatch.mockResolvedValue(undefined);
  arenaRoomMocks.getMatch.mockResolvedValue(match);

  arenaRoomMocks.useArenaRoomRealtime.mockImplementation((input: RealtimeInput) => {
    latestRealtimeInput = input;
  });
  arenaRoomMocks.useArenaRoomPolling.mockImplementation((input: PollingInput) => {
    latestPollingInput = input;
  });
}

export function ArenaRoomHarness({ matchId = "match-1" }: { matchId?: string }) {
  const model = useArenaRoomState(matchId);

  return (
    <div>
      <span data-testid="viewer-id">{model.viewerId ?? "none"}</span>
      <span data-testid="load-state">{model.loadState}</span>
      <span data-testid="error-message">{model.errorMessage ?? "none"}</span>
      <span data-testid="match-id">{model.match?.id ?? "none"}</span>
      <span data-testid="match-status">{model.match?.status ?? "none"}</span>
      <span data-testid="selected-language">{model.selectedLanguage ?? "none"}</span>
      <span data-testid="current-code">{model.currentCode}</span>
      <span data-testid="submission-status">{model.submissionStatus}</span>
      <span data-testid="output-message">{model.outputMessage}</span>
      <span data-testid="active-tab">{model.activeWorkspaceTab}</span>
      <span data-testid="own-submission-id">{model.ownSubmission?.id ?? "none"}</span>
      <span data-testid="is-submitting">{String(model.isSubmitting)}</span>
      <span data-testid="is-surrendering">{String(model.isSurrendering)}</span>
      <span data-testid="self-score">{String(model.selfScore)}</span>
      <span data-testid="opponent-score">{String(model.opponentScore)}</span>
      <span data-testid="self-attempts">{String(model.selfAttempts)}</span>
      <span data-testid="opponent-attempts">{String(model.opponentAttempts)}</span>
      <span data-testid="self-solved">{String(model.selfSolved)}</span>
      <span data-testid="opponent-solved">{String(model.opponentSolved)}</span>

      <button type="button" onClick={() => model.setActiveWorkspaceTab("console")}>
        tab-console
      </button>
      <button type="button" onClick={() => model.setActiveWorkspaceTab("testcases")}>
        tab-testcases
      </button>
      <button type="button" onClick={() => model.setSelectedLanguage("python")}>
        set-python
      </button>
      <button type="button" onClick={() => model.setSelectedLanguage("typescript")}>
        set-typescript
      </button>
      <button type="button" onClick={() => model.setCurrentCode("TS code")}>
        set-code
      </button>
      <button type="button" onClick={() => model.setCurrentCode("PY code")}>
        set-code-alt
      </button>
      <button type="button" onClick={() => void model.submitSolution()}>
        submit
      </button>
      <button type="button" onClick={() => void model.surrenderMatch()}>
        surrender
      </button>
      <button type="button" onClick={() => void model.refreshMatch()}>
        refresh
      </button>
    </div>
  );
}

export type PollSubmissionMockInput = {
  initialSubmission: TaskSubmission;
  isMounted: () => boolean;
  onUpdate: (submission: TaskSubmission) => void;
  setAbortController: (controller: AbortController | null) => void;
};
