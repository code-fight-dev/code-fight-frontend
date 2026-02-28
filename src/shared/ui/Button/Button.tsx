import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "font-accent relative inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  const variants: Record<string, string> = {
    ghost:
      "border border-transparent text-white/80 hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-50 hover:shadow-[0_10px_30px_rgba(37,99,235,0.12)]",
    primary:
      "border border-blue-400/40 bg-blue-500 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_14px_30px_rgba(37,99,235,0.18)] hover:border-blue-300/60 hover:bg-blue-400 hover:shadow-[0_0_0_1px_rgba(96,165,250,0.45),0_18px_38px_rgba(37,99,235,0.28)] focus-visible:ring-blue-400 " +
      "before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle,rgba(96,165,250,0.35)_0%,rgba(59,130,246,0.14)_48%,transparent_76%)] before:opacity-0 before:blur-xl before:transition-opacity before:duration-200 before:-z-10 hover:before:opacity-100",
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
}
