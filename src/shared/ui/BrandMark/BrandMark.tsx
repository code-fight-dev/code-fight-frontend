import { cn } from "@/shared/lib/cn";

type Props = {
  className?: string;
  iconClassName?: string;
};

export function BrandMark({ className, iconClassName }: Props) {
  return (
    <span
      className={cn(
        "grid h-8.5 w-8.5 place-items-center rounded-xl border border-blue-400/18 bg-[#2563eb] shadow-[0_10px_28px_rgba(37,99,235,0.34)]",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className={cn("h-7 w-7 text-white", iconClassName)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3.25" y="4.25" width="13.5" height="11.5" rx="2.2" />
        <path d="M6.5 9.25 8.75 11.5 6.5 13.75" />
        <path
          d="M10.2 13.75h3.6"
          strokeWidth="1.9"
          style={{
            opacity: 0,
            animation: "terminal-cursor-blink 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          }}
        />
      </svg>
    </span>
  );
}
