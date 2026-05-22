"use client";

import Link from "next/link";
import { LogOut, Trophy } from "lucide-react";
import type { Match, MatchWinningReason } from "@/entities/match";

type Props = {
  match: Match;
  viewerId: string | null;
};

const WINNING_REASON_LABELS: Record<MatchWinningReason, string> = {
  accepted_faster: "Solved first",
  accepted_more_tests: "Higher score when time expired",
  opponent_failed: "Opponent failed",
  surrender: "Surrender",
  draw: "Draw by equal result",
  cancelled: "Match cancelled",
};

function formatSignedDelta(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function getOutcome(match: Match, viewerId: string | null) {
  const isPlayer1 = viewerId === match.player1Id;
  const isPlayer2 = viewerId === match.player2Id;
  const isParticipant = isPlayer1 || isPlayer2;
  const selfRatingDelta = isPlayer1
    ? match.player1RatingDelta
    : isPlayer2
      ? match.player2RatingDelta
      : undefined;

  if (match.resultType === "draw" || !match.winnerId) {
    return {
      title: "Match ended in a draw",
      winnerLabel: "No winner",
      resultLabel: "Draw",
      viewerWon: false,
      selfRatingDelta,
    };
  }

  const viewerWon = isParticipant && match.winnerId === viewerId;
  const winnerLabel = match.winnerId === match.player1Id ? "Player 1" : "Player 2";

  return {
    title: viewerWon ? "You won the match" : "Opponent won the match",
    winnerLabel: viewerWon ? "You" : isParticipant ? "Opponent" : winnerLabel,
    resultLabel: viewerWon ? "Victory" : "Defeat",
    viewerWon,
    selfRatingDelta,
  };
}

function getReasonLabel(match: Match, viewerWon: boolean) {
  if (match.winningReason === "surrender") {
    return viewerWon ? "Opponent surrendered" : "You surrendered";
  }

  return match.winningReason
    ? WINNING_REASON_LABELS[match.winningReason]
    : "Final result received";
}

export function ArenaMatchFinishedOverlay({ match, viewerId }: Props) {
  const outcome = getOutcome(match, viewerId);
  const reasonLabel = getReasonLabel(match, outcome.viewerWon);
  const scoreLabel = `${match.player1Score} : ${match.player2Score}`;
  const ratingLabel =
    match.isRated && typeof outcome.selfRatingDelta === "number"
      ? `${formatSignedDelta(outcome.selfRatingDelta)} ELO`
      : match.isRated
        ? "Rating update pending"
        : "Unrated match";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-finished-title"
      className="arena-accept-overlay fixed inset-0 z-60 flex items-center justify-center px-4"
    >
      <div className="arena-accept-backdrop absolute inset-0" />
      <div className="arena-accept-modal relative w-full max-w-xl rounded-3xl px-6 py-7 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-500/12 px-3 py-1 text-[12px] font-semibold text-emerald-100">
          <Trophy className="h-3.5 w-3.5" />
          Match finished
        </div>
        <h3
          id="arena-finished-title"
          className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-(--app-text-strong)"
        >
          {outcome.title}
        </h3>
        <p className="mt-2 text-[15px] leading-7 text-(--app-text-muted)">
          The duel has ended. You can return to matchmaking and look for another match.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="arena-accept-state rounded-xl px-3 py-2 text-[13px]">
            <span className="block text-(--app-text-faint)">Result</span>
            <span className="font-semibold text-(--app-text-strong)">
              {outcome.resultLabel}
            </span>
          </div>
          <div className="arena-accept-state rounded-xl px-3 py-2 text-[13px]">
            <span className="block text-(--app-text-faint)">Winner</span>
            <span className="font-semibold text-(--app-text-strong)">
              {outcome.winnerLabel}
            </span>
          </div>
          <div className="arena-accept-state rounded-xl px-3 py-2 text-[13px]">
            <span className="block text-(--app-text-faint)">Reason</span>
            <span className="font-semibold text-(--app-text-strong)">{reasonLabel}</span>
          </div>
          <div className="arena-accept-state rounded-xl px-3 py-2 text-[13px]">
            <span className="block text-(--app-text-faint)">Score</span>
            <span className="font-semibold text-(--app-text-strong)">{scoreLabel}</span>
          </div>
          <div className="arena-accept-state rounded-xl px-3 py-2 text-[13px]">
            <span className="block text-(--app-text-faint)">Rating</span>
            <span className="font-semibold text-(--app-text-strong)">{ratingLabel}</span>
          </div>
        </div>

        <Link
          href="/arena"
          className="arena-accept-button mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-semibold"
        >
          <LogOut className="h-4.5 w-4.5" />
          Leave match room
        </Link>
      </div>
    </div>
  );
}
