import { Play, Send } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ChallengeWorkspaceAction } from "../model/workspace";
import { getWorkspaceActionLabel } from "../model/workspace";

type Props = {
  action: ChallengeWorkspaceAction;
  disabled: boolean;
  onClick: () => void;
};

export function ChallengeWorkspaceActionButton({ action, disabled, onClick }: Props) {
  const Icon = action === "run" ? Play : Send;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "challenge-focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-55",
        action === "run"
          ? "challenge-action-run border-cyan-300/35 bg-cyan-300/12 text-cyan-50 hover:border-cyan-200/50 hover:bg-cyan-300/18 focus-visible:ring-cyan-300/70"
          : "challenge-action-submit border-emerald-300/35 bg-emerald-300/12 text-emerald-50 hover:border-emerald-200/50 hover:bg-emerald-300/18 focus-visible:ring-emerald-300/70",
      )}
    >
      <Icon aria-hidden className="h-4 w-4" />
      {getWorkspaceActionLabel(action)}
    </button>
  );
}
