import Link from "next/link";
import type { MouseEventHandler } from "react";

type Props = {
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function Logo({ href = "/", onClick }: Props) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="font-accent inline-flex items-center gap-3.5 text-white transition-opacity hover:opacity-90"
    >
      <span className="grid h-8.5 w-8.5 place-items-center rounded-xl border border-white/10 bg-[#2563eb] shadow-[0_10px_28px_rgba(37,99,235,0.34)]">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="h-7 w-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.25" y="4.25" width="13.5" height="11.5" rx="2.2" />
          <path d="M6.5 9.25 8.75 11.5 6.5 13.75" />
          <path d="M10.5 13.75h3" />
        </svg>
      </span>
      <span className="text-[1.35rem] font-semibold tracking-[-0.05em] text-white">
        Arena<span className="text-[#60a5fa]">.</span>
      </span>
    </Link>
  );
}
