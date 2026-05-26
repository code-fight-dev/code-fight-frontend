import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UseArenaRoomStateResult } from "@/features/arena-room/model/types";
import { ArenaMatchRoomPageView } from "@/views/arena-match-room/ui/ArenaMatchRoomPageView";
import {
  createArenaMatchFixture,
  createChallengeFixture,
  createTaskSubmissionFixture,
} from "@/test/features/arena-room/model/fixtures";

const pageViewMocks = vi.hoisted(() => ({
  useArenaRoomState: vi.fn(),
  useSurrenderConfirm: vi.fn(),
  ArenaRoomHeaderBar: vi.fn(),
  ArenaRoomScoreStrip: vi.fn(),
  ArenaRoomProblemPanel: vi.fn(),
  ArenaRoomWorkspaceShell: vi.fn(),
  ArenaSurrenderConfirmDialog: vi.fn(),
  ArenaMatchFinishedOverlay: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/arena-room", () => ({
  useArenaRoomState: pageViewMocks.useArenaRoomState,
}));

vi.mock("@/views/arena-match-room/model/useSurrenderConfirm", () => ({
  useSurrenderConfirm: pageViewMocks.useSurrenderConfirm,
}));

vi.mock("@/views/arena-match-room/ui/ArenaRoomHeaderBar", () => ({
  ArenaRoomHeaderBar: (props: Record<string, unknown>) => {
    pageViewMocks.ArenaRoomHeaderBar(props);
    return <div data-testid="arena-room-header-bar">header</div>;
  },
}));

vi.mock("@/views/arena-match-room/ui/ArenaRoomScoreStrip", () => ({
  ArenaRoomScoreStrip: (props: Record<string, unknown>) => {
    pageViewMocks.ArenaRoomScoreStrip(props);
    return <div data-testid="arena-room-score-strip">score</div>;
  },
}));

vi.mock("@/views/arena-match-room/ui/ArenaRoomProblemPanel", () => ({
  ArenaRoomProblemPanel: (props: Record<string, unknown>) => {
    pageViewMocks.ArenaRoomProblemPanel(props);
    return <div data-testid="arena-room-problem-panel">problem</div>;
  },
}));

vi.mock("@/views/arena-match-room/ui/ArenaRoomWorkspaceShell", () => ({
  ArenaRoomWorkspaceShell: (props: Record<string, unknown>) => {
    pageViewMocks.ArenaRoomWorkspaceShell(props);
    return <div data-testid="arena-room-workspace-shell">workspace</div>;
  },
}));

vi.mock("@/views/arena-match-room/ui/ArenaSurrenderConfirmDialog", () => ({
  ArenaSurrenderConfirmDialog: (props: Record<string, unknown>) => {
    pageViewMocks.ArenaSurrenderConfirmDialog(props);
    return <div data-testid="arena-surrender-confirm-dialog">dialog</div>;
  },
}));

vi.mock("@/views/arena-match-room/ui/ArenaMatchFinishedOverlay", () => ({
  ArenaMatchFinishedOverlay: (props: Record<string, unknown>) => {
    pageViewMocks.ArenaMatchFinishedOverlay(props);
    return <div data-testid="arena-match-finished-overlay">overlay</div>;
  },
}));

function createReadyState(
  overrides: Partial<UseArenaRoomStateResult> = {},
): UseArenaRoomStateResult {
  return {
    viewerId: "viewer-1",
    loadState: "ready",
    errorMessage: null,
    match: createArenaMatchFixture({
      id: "match-1",
      player1Id: "viewer-1",
      player2Id: "viewer-2",
      status: "running",
      player1Score: 40,
      player2Score: 35,
      player1Attempts: 3,
      player2Attempts: 4,
      player1Solved: false,
      player2Solved: false,
    }),
    challenge: createChallengeFixture(),
    selectedLanguage: "typescript",
    currentCode: "function solve() {}",
    submissionStatus: "idle",
    outputMessage: "Ready",
    activeWorkspaceTab: "testcases",
    ownSubmission: createTaskSubmissionFixture(),
    isSubmitting: false,
    isSurrendering: false,
    selfScore: 40,
    opponentScore: 35,
    selfAttempts: 3,
    opponentAttempts: 4,
    selfSolved: false,
    opponentSolved: false,
    setActiveWorkspaceTab: vi.fn(),
    setSelectedLanguage: vi.fn(),
    setCurrentCode: vi.fn(),
    submitSolution: vi.fn().mockResolvedValue(undefined),
    surrenderMatch: vi.fn().mockResolvedValue(undefined),
    refreshMatch: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

type SurrenderConfirmState = {
  isDialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  confirmSurrender: () => void;
};

function createSurrenderConfirmState(overrides: Partial<SurrenderConfirmState> = {}) {
  return {
    isDialogOpen: false,
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    confirmSurrender: vi.fn(),
    ...overrides,
  };
}

function renderPageView(
  props: ComponentProps<typeof ArenaMatchRoomPageView> = { matchId: "match-1" },
) {
  return render(<ArenaMatchRoomPageView {...props} />);
}

describe("views/arena-match-room/ui/ArenaMatchRoomPageView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pageViewMocks.useSurrenderConfirm.mockReturnValue(createSurrenderConfirmState());
  });

  it("renders loading skeleton while room state is loading", () => {
    pageViewMocks.useArenaRoomState.mockReturnValue(
      createReadyState({
        loadState: "loading",
      }),
    );

    const { container } = renderPageView();

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
    expect(screen.queryByTestId("arena-room-header-bar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("arena-room-workspace-shell")).not.toBeInTheDocument();
  });

  it("renders error state with back link when room cannot be opened", () => {
    pageViewMocks.useArenaRoomState.mockReturnValue(
      createReadyState({
        loadState: "error",
        errorMessage: "Match room is unavailable.",
      }),
    );

    renderPageView();

    expect(
      screen.getByRole("heading", { name: "Arena room unavailable", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Match room is unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to arena" })).toHaveAttribute(
      "href",
      "/arena",
    );
  });

  it("renders fallback error state when required data is missing", () => {
    pageViewMocks.useArenaRoomState.mockReturnValue(
      createReadyState({
        challenge: null,
      }),
    );

    renderPageView();

    expect(
      screen.getByText("Unable to open this match room right now."),
    ).toBeInTheDocument();
  });

  it("renders room sections in ready state and forwards model data to children", () => {
    const roomState = createReadyState();
    const surrenderState = createSurrenderConfirmState({
      isDialogOpen: true,
    });

    pageViewMocks.useArenaRoomState.mockReturnValue(roomState);
    pageViewMocks.useSurrenderConfirm.mockReturnValue(surrenderState);

    renderPageView({
      matchId: "match-room-42",
    });

    expect(pageViewMocks.useArenaRoomState).toHaveBeenCalledWith("match-room-42");
    expect(pageViewMocks.useSurrenderConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        canSurrender: true,
        isSurrendering: false,
      }),
    );

    const surrenderConfirmParams = pageViewMocks.useSurrenderConfirm.mock.calls.at(
      -1,
    )?.[0] as { onSurrender: () => void } | undefined;

    if (!surrenderConfirmParams) {
      throw new Error("Expected useSurrenderConfirm call arguments");
    }

    surrenderConfirmParams.onSurrender();
    expect(roomState.surrenderMatch).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId("arena-room-header-bar")).toBeInTheDocument();
    expect(screen.getByTestId("arena-room-score-strip")).toBeInTheDocument();
    expect(screen.getByTestId("arena-room-problem-panel")).toBeInTheDocument();
    expect(screen.getByTestId("arena-room-workspace-shell")).toBeInTheDocument();
    expect(screen.getByTestId("arena-surrender-confirm-dialog")).toBeInTheDocument();
    expect(screen.queryByTestId("arena-match-finished-overlay")).not.toBeInTheDocument();

    expect(pageViewMocks.ArenaRoomHeaderBar).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: "match-1",
        opponentId: "viewer-2",
        status: "running",
        isSurrendering: false,
        onSurrenderClick: surrenderState.openDialog,
      }),
    );

    expect(pageViewMocks.ArenaRoomWorkspaceShell).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge: roomState.challenge,
        selectedLanguage: "typescript",
        currentCode: "function solve() {}",
        submissionStatus: "idle",
        outputMessage: "Ready",
        activeWorkspaceTab: "testcases",
        ownSubmission: roomState.ownSubmission,
        isSubmitting: false,
        setActiveWorkspaceTab: roomState.setActiveWorkspaceTab,
        setSelectedLanguage: roomState.setSelectedLanguage,
        setCurrentCode: roomState.setCurrentCode,
        submitSolution: roomState.submitSolution,
      }),
    );

    expect(pageViewMocks.ArenaSurrenderConfirmDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        isSurrendering: false,
        onClose: surrenderState.closeDialog,
        onConfirm: surrenderState.confirmSurrender,
      }),
    );
  });

  it("renders finished overlay and disables surrender flow when match is finished", () => {
    const roomState = createReadyState({
      match: createArenaMatchFixture({
        status: "finished",
      }),
    });

    pageViewMocks.useArenaRoomState.mockReturnValue(roomState);
    pageViewMocks.useSurrenderConfirm.mockReturnValue(createSurrenderConfirmState());

    renderPageView();

    expect(pageViewMocks.useSurrenderConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        canSurrender: false,
      }),
    );
    expect(screen.getByTestId("arena-match-finished-overlay")).toBeInTheDocument();
    expect(pageViewMocks.ArenaMatchFinishedOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        match: roomState.match,
        viewerId: "viewer-1",
      }),
    );
  });
});
