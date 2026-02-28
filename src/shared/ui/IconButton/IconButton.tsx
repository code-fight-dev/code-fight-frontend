import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
};

export function IconButton({ className, ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-white/70 transition-all duration-200 hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-50 hover:shadow-[0_10px_30px_rgba(37,99,235,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
