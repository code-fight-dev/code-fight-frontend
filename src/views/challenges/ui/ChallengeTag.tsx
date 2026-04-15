import { cn } from "@/shared/lib/cn";

type Props = {
  children: string;
  className?: string;
};

export function ChallengeTag({ children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border border-(--app-option-border) bg-(--app-option-bg) px-2.5 text-[12px] font-medium text-(--app-text-soft)",
        className,
      )}
    >
      {children}
    </span>
  );
}
