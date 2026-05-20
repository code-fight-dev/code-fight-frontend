import { cn } from "@/shared/lib/cn";

type Props = {
  className?: string;
};

export function AmbientGrid({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "app-motion-decorative pointer-events-none absolute inset-0 bg-[linear-gradient(var(--app-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--app-grid-line)_1px,transparent_1px)] bg-size-[40px_40px]",
        className,
      )}
    />
  );
}
