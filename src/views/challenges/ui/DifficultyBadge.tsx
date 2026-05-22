import { getDifficultyClassName } from "@/entities/challenge";
import type { ChallengeDifficulty } from "@/entities/challenge";
import { cn } from "@/shared/lib/cn";

type Props = {
  difficulty: ChallengeDifficulty;
  className?: string;
};

export function DifficultyBadge({ difficulty, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[13px] font-semibold",
        getDifficultyClassName(difficulty),
        className,
      )}
    >
      {difficulty}
    </span>
  );
}
