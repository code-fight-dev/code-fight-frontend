import { Reveal } from "@/shared/ui/Reveal";
import { HeroTypingSnippet } from "./HeroTypingSnippet";

export function HeroPreview() {
  return (
    <Reveal
      className="relative mx-auto w-full max-w-2xl lg:max-w-none"
      delay={140}
      variant="scale"
    >
      <div
        aria-hidden
        className="absolute inset-x-[8%] top-[18%] h-[56%] rounded-full bg-[#2563eb]/28 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[12%] -bottom-3 h-12 rounded-full bg-[#2563eb]/12 blur-2xl"
      />

      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,26,0.96)_0%,rgba(12,18,34,0.92)_100%)] shadow-[0_24px_80px_rgba(3,7,18,0.52),0_0_40px_rgba(37,99,235,0.08)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-blue-400/6 ring-inset"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[20%] -top-10 h-16 rounded-full bg-[#60a5fa]/8 blur-2xl"
        />

        <div className="flex items-center justify-between border-b border-white/6 bg-black/50 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/85" />
          </div>

          <span className="font-accent text-[11px] tracking-[0.12em] text-white/40 sm:text-[12px]">
            match_preview.py
          </span>
        </div>

        <div className="space-y-6 p-4 sm:space-y-8 sm:p-7">
          <pre className="font-accent overflow-x-auto text-[12px] leading-6 tracking-[-0.03em] text-white/72 sm:text-[14px] sm:leading-7 lg:text-[15px] lg:leading-8 2xl:text-[16px] 2xl:leading-9">
            <code>
              <span className="text-[#3b82f6]">def</span>{" "}
              <span className="text-white/86">evaluate_move</span>
              <span className="text-[#60a5fa]">(player_state):</span>
              {"\n"}
              <span className="block text-white/30"># Implement your solution here</span>
              <HeroTypingSnippet />
              <span className="text-white/70">{"    visited = "}</span>
              <span className="text-[#93c5fd]">set</span>
              <span className="text-white/70">()</span>
              {"\n"}
              <span className="text-[#3b82f6]">{"    if"}</span>
              <span className="text-white/70">{" not grid:"}</span>
              {"\n"}
              <span className="text-white/70">{"        return "}</span>
              <span className="text-[#f87171]">None</span>
              {"\n\n"}
              <span className="text-white/30">{"    # Processing..."}</span>
              {"\n"}
              <span className="text-white/70">{"    result = "}</span>
              <span className="text-[#60a5fa]">bfs_optimize</span>
              <span className="text-white/70">(grid, best_move)</span>
              {"\n"}
              <span className="text-[#3b82f6]">{"    return"}</span>
              <span className="text-white/70">{" result"}</span>
            </code>
          </pre>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/18 text-[#60a5fa]">
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11.6 1.75 5.9 10h3.35l-.85 8.25 5.7-8.25h-3.35l.85-8.25Z" />
                </svg>
              </div>
              <div>
                <div className="font-accent text-[11px] font-bold tracking-[0.16em] text-white/32 uppercase">
                  Latency
                </div>
                <div className="mt-1 text-[15px] tracking-[-0.03em] text-white/82 sm:text-[16px]">
                  14ms
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
              <div>
                <div className="font-accent text-[11px] font-bold tracking-[0.16em] text-white/32 uppercase">
                  Status
                </div>
                <div className="mt-1 text-[15px] tracking-[-0.03em] text-white/82 sm:text-[16px]">
                  Syncing
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/14 text-[#4ade80]">
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="10" cy="10" r="5.5" />
                  <path d="m7.75 10 1.5 1.5 3-3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-6 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.4),transparent)]"
        />
      </div>
    </Reveal>
  );
}
