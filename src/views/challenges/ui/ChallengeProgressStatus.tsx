import { CheckCircle2 } from "lucide-react";
import type { ChallengeProgress } from "@/entities/challenge";
import { cn } from "@/shared/lib/cn";

type Props = {
  progress: ChallengeProgress;
  className?: string;
};

export function ChallengeProgressStatus({ progress, className }: Props) {
  if (progress !== "solved") {
    return null;
  }

  return (
    <span
      className={cn(
        "challenge-status-check inline-flex size-9 items-center justify-center rounded-full",
        className,
      )}
      aria-label="Solved"
      title="Solved"
    >
      <CheckCircle2 aria-hidden className="size-5" strokeWidth={2.2} />
    </span>
  );
}
