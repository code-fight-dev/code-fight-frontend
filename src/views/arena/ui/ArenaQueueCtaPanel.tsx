import Link from "next/link";
import { CircleDot, Loader2, Search, Shield, Timer, X } from "lucide-react";
import type {
  ArenaMatchmakingState,
  ArenaQueueSettings,
} from "@/features/arena-matchmaking";
import { cn } from "@/shared/lib/cn";
import { getSelectedDifficultyLabel, getStartButtonLabel } from "../model/presentation";

type Props = {
  isGuest: boolean;
  state: ArenaMatchmakingState;
  queueSettings: ArenaQueueSettings;
  searchElapsedSeconds: number;
  isSseConnected: boolean;
  isBusy: boolean;
  errorMessage: string | null;
  onStart: () => void;
  onCancel: () => void;
};

export function ArenaQueueCtaPanel({
  isGuest,
  state,
  queueSettings,
  searchElapsedSeconds,
  isSseConnected,
  isBusy,
  errorMessage,
  onStart,
  onCancel,
}: Props) {
  const isSearching = state === "searching";
  const canStart = state === "idle" || state === "error";
  const selectedDifficulty = getSelectedDifficultyLabel(queueSettings.taskMode);
  const startButtonLabel = getStartButtonLabel(state, searchElapsedSeconds);

  return (
    <article className="arena-card arena-cta-panel challenge-panel rounded-2xl p-6 sm:p-7">
      <div className="text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
        Ready to queue
      </div>
      <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-(--app-text-strong) sm:text-[2.65rem]">
        Step into the arena
      </h2>
      <p className="mt-3 max-w-2xl text-[1.02rem] leading-8 text-(--app-text-muted)">
        We match you with a fair opponent based on selected difficulty and rating mode.
        Accept in time and the duel starts instantly.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        {isGuest ? (
          <Link href="/signin" className="arena-start-button h-12 rounded-xl px-5">
            Sign in to queue
          </Link>
        ) : (
          <div className="arena-start-button-wrap">
            <button
              type="button"
              disabled={!canStart || isSearching || isBusy}
              onClick={onStart}
              className={cn(
                "arena-start-button h-12 rounded-xl px-5 transition-all disabled:pointer-events-none disabled:opacity-70",
                isSearching
                  ? "arena-start-button-searching arena-start-button-with-cancel"
                  : "arena-start-button-idle",
              )}
            >
              {isBusy ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : isSearching ? (
                <Timer className="h-4.5 w-4.5" />
              ) : (
                <Search className="h-4.5 w-4.5" />
              )}
              <span className="tabular-nums">{startButtonLabel}</span>
            </button>
            {isSearching ? (
              <button
                type="button"
                aria-label="Cancel matchmaking"
                onClick={onCancel}
                className="arena-search-cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        )}

        <div className="arena-queue-summary rounded-xl px-3 py-2.5">
          <div className="arena-queue-summary-label">Mode:</div>
          <div className="arena-queue-summary-value">Global</div>
        </div>
        <div className="arena-queue-summary rounded-xl px-3 py-2.5">
          <div className="arena-queue-summary-label">Difficulty:</div>
          <div className="arena-queue-summary-value">{selectedDifficulty}</div>
        </div>
        <div className="arena-queue-summary rounded-xl px-3 py-2.5">
          <div className="arena-queue-summary-label">Match:</div>
          <div className="arena-queue-summary-value">
            {queueSettings.isRated ? "Rated" : "Unrated"}
          </div>
        </div>
      </div>

      <div className="arena-meta-strip mt-6 grid gap-2 border-t border-(--app-surface-soft-border) pt-4 text-[13px] md:grid-cols-3">
        <div className="inline-flex items-center gap-2">
          <Timer className="h-4 w-4" />
          Match length 20:00
        </div>
        <div className="inline-flex items-center gap-2">
          <Shield className="h-4 w-4" />
          ELO range +/-120
        </div>
        <div className="inline-flex items-center gap-2">
          <CircleDot className="h-4 w-4" />
          {isSseConnected ? "Realtime online" : "Realtime degraded, polling active"}
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-rose-300/28 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-100">
          {errorMessage}
        </p>
      ) : null}
    </article>
  );
}
