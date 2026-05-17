import type { ArenaQueueSettings } from "@/features/arena-matchmaking";
import { cn } from "@/shared/lib/cn";

type Props = {
  queueSettings: ArenaQueueSettings;
  isLocked: boolean;
  setTaskMode: (taskMode: ArenaQueueSettings["taskMode"]) => void;
  setIsRated: (isRated: boolean) => void;
};

export function ArenaQueueSettingsCard({
  queueSettings,
  isLocked,
  setTaskMode,
  setIsRated,
}: Props) {
  return (
    <article className="arena-card challenge-panel rounded-2xl p-4">
      <div className="text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
        Queue settings
      </div>

      <div className="mt-4">
        <div className="text-[12px] font-semibold text-(--app-text-soft)">Difficulty</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={cn(
              "arena-option h-10 rounded-lg px-3 text-[13px] font-semibold transition-colors",
              queueSettings.taskMode === "normal"
                ? "arena-option-active"
                : "arena-option-idle",
            )}
            disabled={isLocked}
            onClick={() => setTaskMode("normal")}
          >
            Normal
          </button>
          <button
            type="button"
            className={cn(
              "arena-option h-10 rounded-lg px-3 text-[13px] font-semibold transition-colors",
              queueSettings.taskMode === "hard"
                ? "arena-option-active"
                : "arena-option-idle",
            )}
            disabled={isLocked}
            onClick={() => setTaskMode("hard")}
          >
            Hard
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-(--app-option-border) bg-(--app-option-bg) px-3 py-2.5">
        <div>
          <div className="text-[13px] font-semibold text-(--app-text-soft)">
            Rated match
          </div>
          <div className="text-[11px] text-(--app-text-faint)">Affects ELO and rank</div>
        </div>

        <button
          type="button"
          disabled={isLocked}
          onClick={() => setIsRated(!queueSettings.isRated)}
          className={cn(
            "arena-rated-switch",
            queueSettings.isRated && "arena-rated-switch-on",
          )}
          aria-pressed={queueSettings.isRated}
        >
          <span className="arena-rated-switch-thumb" />
        </button>
      </div>
    </article>
  );
}
