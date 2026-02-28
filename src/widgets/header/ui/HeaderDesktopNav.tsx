import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { HEADER_NAV } from "../model/nav";

type Props = {
  isElevated: boolean;
};

export function HeaderDesktopNav({ isElevated }: Props) {
  return (
    <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-3 lg:flex xl:gap-5 2xl:gap-6">
      {HEADER_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "font-accent rounded-full border border-transparent px-3 py-1.5 font-medium tracking-[-0.025em] text-white/72 transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-50 hover:shadow-[0_10px_30px_rgba(37,99,235,0.1)]",
            isElevated ? "text-[13px] xl:text-[14px]" : "text-[14px] xl:text-[15px]",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
