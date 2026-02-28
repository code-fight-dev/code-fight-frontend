import Link from "next/link";

type Props = {
  href?: string;
};

export function Logo({ href = "/" }: Props) {
  return (
    <Link
      href={href}
      className="font-accent inline-flex items-center gap-3.5 text-white transition-opacity hover:opacity-90"
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-[#2563eb] shadow-[0_8px_24px_rgba(37,99,235,0.32)]">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="h-4 w-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
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
