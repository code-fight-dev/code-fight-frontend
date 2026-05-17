import { Check, Loader2, Timer } from "lucide-react";
import { formatDuration } from "../model/presentation";

type Props = {
  visible: boolean;
  acceptRemainingSeconds: number;
  selfAccepted: boolean;
  opponentAccepted: boolean;
  isBusy: boolean;
  onAccept: () => void;
};

export function ArenaAcceptOverlay({
  visible,
  acceptRemainingSeconds,
  selfAccepted,
  opponentAccepted,
  isBusy,
  onAccept,
}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-accept-title"
      className="arena-accept-overlay fixed inset-0 z-60 flex items-center justify-center px-4"
    >
      <div className="arena-accept-backdrop absolute inset-0" />
      <div className="arena-accept-modal relative w-full max-w-xl rounded-3xl px-6 py-7 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/35 bg-blue-500/12 px-3 py-1 text-[12px] font-semibold text-blue-100">
          <Timer className="h-3.5 w-3.5" />
          Accept window {formatDuration(acceptRemainingSeconds)}
        </div>
        <h3
          id="arena-accept-title"
          className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-(--app-text-strong)"
        >
          Match found
        </h3>
        <p className="mt-2 text-[15px] leading-7 text-(--app-text-muted)">
          Confirm your readiness to start this duel. Both players must accept before timer
          expires.
        </p>

        <div className="mt-5 grid gap-2">
          <div className="arena-accept-state rounded-xl px-3 py-2 text-[13px]">
            <span className="text-(--app-text-faint)">You:</span>{" "}
            <span className="font-semibold text-(--app-text-strong)">
              {selfAccepted ? "Accepted" : "Waiting"}
            </span>
          </div>
          <div className="arena-accept-state rounded-xl px-3 py-2 text-[13px]">
            <span className="text-(--app-text-faint)">Opponent:</span>{" "}
            <span className="font-semibold text-(--app-text-strong)">
              {opponentAccepted ? "Accepted" : "Waiting"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAccept}
          disabled={selfAccepted || isBusy}
          className="arena-accept-button mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-semibold disabled:pointer-events-none disabled:opacity-65"
        >
          {isBusy ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Check className="h-4.5 w-4.5" />
          )}
          {selfAccepted ? "Accepted" : "Accept match"}
        </button>
      </div>
    </div>
  );
}
