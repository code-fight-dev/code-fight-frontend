import { cn } from "@/shared/lib/cn";

type Props = {
  className?: string;
};

export function AmbientGrid({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-size-[40px_40px]",
        className,
      )}
    />
  );
}
