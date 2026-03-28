import { cn } from "@/shared/lib/cn";

type Props = Readonly<{
  className?: string;
  message: string | null;
}>;

export function ProfileSettingsErrorNotice({ className, message }: Props) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-red-400/18 bg-red-500/8 tracking-[-0.02em] text-red-400",
        className,
      )}
    >
      {message}
    </div>
  );
}
