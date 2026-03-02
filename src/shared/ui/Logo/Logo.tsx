import Link from "next/link";
import type { MouseEventHandler } from "react";
import { BrandMark } from "@/shared/ui/BrandMark";

type Props = {
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function Logo({ href = "/", onClick }: Props) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="font-accent inline-flex items-center gap-3.5 text-(--app-text-strong) transition-opacity hover:opacity-90"
    >
      <BrandMark />
      <span className="text-[1.35rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
        Arena<span className="text-[#60a5fa]">.</span>
      </span>
    </Link>
  );
}
