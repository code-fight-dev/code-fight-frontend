import { BookOpenText } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Reveal } from "@/shared/ui/Reveal";
import type { DocsPageData } from "../model/types";

type Props = Readonly<{
  data: DocsPageData;
}>;

export function DocsHero({ data }: Props) {
  return (
    <section id="docs-overview" className="scroll-mt-36">
      <Reveal className="app-shell-card relative overflow-hidden rounded-[34px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div
          aria-hidden
          className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.14),transparent_24%),radial-gradient(circle_at_88%_74%,rgba(59,130,246,0.12),transparent_22%)]"
        />

        <div className="relative">
          <div className="font-accent inline-flex items-center gap-2 rounded-full border border-blue-400/22 bg-blue-500/10 px-3.5 py-2 text-[11px] tracking-[0.2em] text-blue-200 uppercase">
            <BookOpenText className="h-3.5 w-3.5" strokeWidth={2} />
            Documentation
          </div>

          <h1 className="mt-6 max-w-4xl text-[2.2rem] leading-[1.04] font-semibold tracking-[-0.08em] text-(--app-text-strong) sm:text-[3rem] lg:text-[3.5rem] xl:text-[3.9rem]">
            CodeFight Platform
            <span className="mt-2 block bg-[linear-gradient(180deg,#7dd3fc_0%,#3b82f6_58%,#1d4ed8_100%)] bg-clip-text text-transparent">
              Documentation Center
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-[15px] leading-[1.78] tracking-[-0.03em] text-(--app-text-soft) sm:text-[16px]">
            Product guides, integration details, and lifecycle behavior for Arena,
            Challenges, Rankings, and account workflows. Last updated{" "}
            <span className="text-(--app-text-strong)">{data.updatedAtLabel}</span>.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              href="/challenges"
              className="min-h-12 w-full rounded-xl px-6 text-[14px] sm:w-auto"
            >
              Explore Challenges
            </Button>
            <Button
              href="/status"
              variant="secondary"
              className="min-h-12 w-full rounded-xl px-6 text-[14px] sm:w-auto"
            >
              Check System Status
            </Button>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {data.heroMetrics.map((metric) => (
              <article
                key={metric.label}
                className="app-overlay-card rounded-2xl border border-white/8 px-4 py-4"
              >
                <p className="font-accent text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
                  {metric.value}
                </p>
                <p className="mt-1 text-[1.35rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
                  {metric.label}
                </p>
                <p className="mt-1 text-[13px] leading-6 text-(--app-text-muted)">
                  {metric.caption}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
