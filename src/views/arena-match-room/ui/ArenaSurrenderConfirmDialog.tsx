import { Flag, TriangleAlert } from "lucide-react";

type Props = {
  isOpen: boolean;
  isSurrendering: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ArenaSurrenderConfirmDialog({
  isOpen,
  isSurrendering,
  onClose,
  onConfirm,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-surrender-title"
      className="arena-accept-overlay fixed inset-0 z-60 flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Close surrender confirmation"
        className="arena-accept-backdrop absolute inset-0"
        onClick={onClose}
      />
      <div className="arena-accept-modal relative w-full max-w-lg rounded-3xl px-6 py-7 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-300/35 bg-red-500/12 px-3 py-1 text-[12px] font-semibold text-red-100">
          <TriangleAlert className="h-3.5 w-3.5" />
          Confirm surrender
        </div>
        <h3
          id="arena-surrender-title"
          className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-(--app-text-strong)"
        >
          Surrender this match?
        </h3>
        <p className="mt-2 text-[15px] leading-7 text-(--app-text-muted)">
          This action ends the duel immediately and records a defeat for you.
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="challenge-focus-ring inline-flex h-11 items-center justify-center rounded-xl border border-(--app-option-border) bg-(--app-option-bg) px-4 text-[14px] font-semibold text-(--app-text-muted) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSurrendering}
            className="challenge-focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/12 px-4 text-[14px] font-semibold text-red-100 transition-colors hover:border-red-300/55 hover:bg-red-500/18 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Flag className="h-4 w-4" />
            {isSurrendering ? "Surrendering..." : "Yes, surrender"}
          </button>
        </div>
      </div>
    </div>
  );
}
