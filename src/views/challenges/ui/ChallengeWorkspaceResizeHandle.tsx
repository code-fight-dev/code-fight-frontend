import type { PointerEvent as ReactPointerEvent } from "react";
import { GripVertical } from "lucide-react";

type Props = {
  onResizeStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

export function ChallengeWorkspaceResizeHandle({ onResizeStart }: Props) {
  return (
    <button
      type="button"
      aria-label="Resize problem and editor panels"
      onPointerDown={onResizeStart}
      className="challenge-panel-muted challenge-focus-ring hidden cursor-col-resize items-center justify-center rounded-lg text-(--app-text-faint) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong) lg:flex"
    >
      <GripVertical aria-hidden className="h-5 w-5" />
    </button>
  );
}
