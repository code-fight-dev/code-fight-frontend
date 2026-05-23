"use client";

import Link from "next/link";
import { useArenaRoomState } from "@/features/arena-room";
import { Container } from "@/shared/ui/Container";
import { useSurrenderConfirm } from "../model/useSurrenderConfirm";
import { ArenaMatchFinishedOverlay } from "./ArenaMatchFinishedOverlay";
import { ArenaRoomHeaderBar } from "./ArenaRoomHeaderBar";
import { ArenaRoomProblemPanel } from "./ArenaRoomProblemPanel";
import { ArenaRoomScoreStrip } from "./ArenaRoomScoreStrip";
import { ArenaSurrenderConfirmDialog } from "./ArenaSurrenderConfirmDialog";
import { ArenaRoomWorkspaceShell } from "./ArenaRoomWorkspaceShell";

type Props = {
  matchId: string;
};

export function ArenaMatchRoomPageView({ matchId }: Props) {
  const {
    viewerId,
    loadState,
    errorMessage,
    match,
    challenge,
    selectedLanguage,
    currentCode,
    submissionStatus,
    outputMessage,
    activeWorkspaceTab,
    ownSubmission,
    isSubmitting,
    isSurrendering,
    selfScore,
    opponentScore,
    selfAttempts,
    opponentAttempts,
    selfSolved,
    opponentSolved,
    setActiveWorkspaceTab,
    setSelectedLanguage,
    setCurrentCode,
    submitSolution,
    surrenderMatch,
  } = useArenaRoomState(matchId);
  const {
    isDialogOpen: isSurrenderDialogOpen,
    openDialog: openSurrenderDialog,
    closeDialog: closeSurrenderDialog,
    confirmSurrender,
  } = useSurrenderConfirm({
    canSurrender: match?.status === "running",
    isSurrendering,
    onSurrender: () => {
      void surrenderMatch();
    },
  });

  if (loadState === "loading") {
    return (
      <section className="challenge-page py-8 sm:py-10">
        <Container>
          <div className="challenge-panel-soft h-36 animate-pulse rounded-2xl" />
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="challenge-panel-soft h-120 animate-pulse rounded-2xl" />
            <div className="challenge-panel-soft h-120 animate-pulse rounded-2xl" />
          </div>
        </Container>
      </section>
    );
  }

  if (loadState === "error" || !challenge || !match || !selectedLanguage) {
    return (
      <section className="challenge-page py-10">
        <Container>
          <div className="challenge-panel mx-auto max-w-2xl rounded-2xl p-6 text-center sm:p-8">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-(--app-text-strong)">
              Arena room unavailable
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-(--app-text-muted)">
              {errorMessage ?? "Unable to open this match room right now."}
            </p>
            <Link
              href="/arena"
              className="challenge-focus-ring mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-(--app-option-active-border) bg-(--app-option-active-bg) px-4 text-[13px] font-semibold text-(--app-text-strong)"
            >
              Back to arena
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  const isPlayer1 = viewerId === match.player1Id;
  const opponentId = isPlayer1 ? match.player2Id : match.player1Id;

  return (
    <section className="challenge-page relative overflow-hidden py-4 sm:py-5 lg:py-6">
      <div
        aria-hidden
        className="app-motion-decorative challenge-grid-layer pointer-events-none absolute inset-0 opacity-30"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,12,24,0.14)_100%)]"
      />

      <Container className="relative max-w-none 2xl:max-w-470">
        <ArenaRoomHeaderBar
          matchId={match.id}
          opponentId={opponentId}
          status={match.status}
          isSurrendering={isSurrendering}
          onSurrenderClick={openSurrenderDialog}
        />

        <ArenaRoomScoreStrip
          selfScore={selfScore}
          opponentScore={opponentScore}
          selfAttempts={selfAttempts}
          opponentAttempts={opponentAttempts}
          selfSolved={selfSolved}
          opponentSolved={opponentSolved}
        />

        <div className="grid min-h-[calc(100dvh-11rem)] gap-3 lg:grid-cols-[minmax(22rem,45%)_minmax(24rem,1fr)]">
          <ArenaRoomProblemPanel challenge={challenge} />
          <ArenaRoomWorkspaceShell
            challenge={challenge}
            selectedLanguage={selectedLanguage}
            currentCode={currentCode}
            submissionStatus={submissionStatus}
            outputMessage={outputMessage}
            activeWorkspaceTab={activeWorkspaceTab}
            ownSubmission={ownSubmission}
            isSubmitting={isSubmitting}
            setActiveWorkspaceTab={setActiveWorkspaceTab}
            setSelectedLanguage={setSelectedLanguage}
            setCurrentCode={setCurrentCode}
            submitSolution={submitSolution}
          />
        </div>
      </Container>

      <ArenaSurrenderConfirmDialog
        isOpen={isSurrenderDialogOpen}
        isSurrendering={isSurrendering}
        onClose={closeSurrenderDialog}
        onConfirm={confirmSurrender}
      />

      {match.status === "finished" ? (
        <ArenaMatchFinishedOverlay match={match} viewerId={viewerId} />
      ) : null}
    </section>
  );
}
