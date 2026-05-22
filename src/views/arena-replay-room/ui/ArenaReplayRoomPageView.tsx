"use client";

import Link from "next/link";
import { useMatchReplayState } from "@/features/match-replay";
import { Container } from "@/shared/ui/Container";
import { ArenaReplayCodePanel } from "./ArenaReplayCodePanel";
import { ArenaReplayHeaderBar } from "./ArenaReplayHeaderBar";
import { ArenaReplayTimelinePanel } from "./ArenaReplayTimelinePanel";

type Props = {
  matchId: string;
};

export function ArenaReplayRoomPageView({ matchId }: Props) {
  const {
    loadState,
    errorMessage,
    playbackErrorMessage,
    match,
    challenge,
    canViewReplay,
    canViewSourceCode,
    players,
    activePlayerId,
    checkpoints,
    currentCheckpointIndex,
    currentTimeMs,
    durationMs,
    isPlaying,
    playbackSpeed,
    currentCode,
    currentLanguage,
    setActivePlayerId,
    seekToTime,
    seekToCheckpoint,
    togglePlayback,
    setPlaybackSpeed,
  } = useMatchReplayState(matchId);

  if (loadState === "loading") {
    return (
      <section className="challenge-page py-8 sm:py-10">
        <Container>
          <div className="challenge-panel-soft h-32 animate-pulse rounded-2xl" />
          <div className="mt-4 grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <div className="challenge-panel-soft h-120 animate-pulse rounded-2xl" />
            <div className="challenge-panel-soft h-120 animate-pulse rounded-2xl" />
          </div>
        </Container>
      </section>
    );
  }

  if (
    loadState === "error" ||
    !match ||
    !activePlayerId ||
    !canViewReplay ||
    playbackErrorMessage
  ) {
    return (
      <section className="challenge-page py-10">
        <Container>
          <div className="challenge-panel mx-auto max-w-2xl rounded-2xl p-6 text-center sm:p-8">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-(--app-text-strong)">
              Replay unavailable
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-(--app-text-muted)">
              {errorMessage ??
                playbackErrorMessage ??
                "Unable to open this replay right now."}
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

  const currentCheckpoint = checkpoints[currentCheckpointIndex];
  const challengeTitle =
    challenge?.title ??
    (match.taskId ? `Task ${match.taskId.slice(0, 8)}` : "Match task");

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
        <ArenaReplayHeaderBar
          matchId={match.id}
          status={match.status}
          players={players}
          activePlayerId={activePlayerId}
          onSelectPlayer={setActivePlayerId}
        />

        <div className="mb-3 rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(14,22,42,0.94),rgba(8,12,24,0.9))] p-3 sm:p-4">
          <p className="text-[11px] tracking-[0.16em] text-(--app-text-faint) uppercase">
            Challenge
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            {challengeTitle}
          </h2>
          {challenge?.summary ? (
            <p className="mt-2 max-w-4xl text-[14px] leading-6 text-(--app-text-soft)">
              {challenge.summary}
            </p>
          ) : null}
        </div>

        <div className="grid min-h-[calc(100dvh-14rem)] gap-3 lg:grid-cols-[21rem_minmax(0,1fr)]">
          <ArenaReplayTimelinePanel
            checkpoints={checkpoints}
            currentCheckpointIndex={currentCheckpointIndex}
            currentTimeMs={currentTimeMs}
            durationMs={durationMs}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onSeekToTime={seekToTime}
            onSeekToCheckpoint={seekToCheckpoint}
            onTogglePlayback={togglePlayback}
            onChangePlaybackSpeed={setPlaybackSpeed}
          />
          <ArenaReplayCodePanel
            canViewSourceCode={canViewSourceCode}
            language={currentLanguage}
            code={currentCode}
            title={challengeTitle}
            verdict={currentCheckpoint?.verdict}
            status={currentCheckpoint?.status}
          />
        </div>
      </Container>
    </section>
  );
}
