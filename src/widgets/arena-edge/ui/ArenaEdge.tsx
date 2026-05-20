import { ChartColumnIncreasing, CodeXml, History } from "lucide-react";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import type { ArenaEdgeCard, ArenaEdgeSnapshot } from "../model/types";

type Props = {
  snapshot: ArenaEdgeSnapshot;
};

const arenaEdgeIcons: Record<ArenaEdgeCard["icon"], typeof CodeXml> = {
  realtime: CodeXml,
  elo: ChartColumnIncreasing,
  replay: History,
};

function ArenaEdgeIcon({ icon }: Pick<ArenaEdgeCard, "icon">) {
  const Icon = arenaEdgeIcons[icon];

  return <Icon aria-hidden className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.9} />;
}

export function ArenaEdge({ snapshot }: Props) {
  return (
    <section className="relative overflow-hidden bg-(--app-surface-contrast) py-20 sm:py-24 lg:py-28 xl:py-32">
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(37,99,235,0.1),transparent_22%),radial-gradient(circle_at_86%_78%,rgba(37,99,235,0.08),transparent_24%)]"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-y-0 right-[8%] w-px bg-[linear-gradient(180deg,transparent,var(--app-grid-line),transparent)]"
      />

      <Container className="relative">
        <Reveal className="mx-auto max-w-3xl text-center xl:max-w-4xl" delay={40}>
          <div className="font-accent text-[13px] font-semibold tracking-[0.26em] text-blue-400/92 uppercase sm:text-[14px]">
            {snapshot.eyebrow}
          </div>

          <h2 className="mt-5 text-[2rem] font-semibold tracking-[-0.07em] text-(--app-text-strong) sm:text-[2.7rem] md:text-[3.1rem] xl:text-[3.7rem] 2xl:text-[4.2rem]">
            {snapshot.title}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-[1.72] tracking-[-0.03em] text-(--app-text-soft) sm:mt-5 sm:text-[1.08rem] xl:max-w-184 xl:text-[1.2rem]">
            {snapshot.description}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 xl:mt-16 xl:grid-cols-3 xl:gap-6">
          {snapshot.cards.map((card, index) => (
            <Reveal
              key={card.id}
              delay={
                card.id === "real-time-coding" ? 0 : card.id === "elo-system" ? 90 : 180
              }
              variant="scale"
              className={`app-shell-card group relative overflow-hidden rounded-[22px] px-5 py-5 transition-colors duration-200 hover:border-blue-400/16 sm:px-6 sm:py-6 ${index === snapshot.cards.length - 1 ? "md:col-span-2 xl:col-span-1" : ""}`}
            >
              <div
                aria-hidden
                className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_28%)] opacity-70"
              />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/10 text-[#3b82f6] shadow-[0_12px_30px_rgba(37,99,235,0.1)] sm:h-14 sm:w-14">
                  <ArenaEdgeIcon icon={card.icon} />
                </div>

                <h3 className="mt-6 text-[1.45rem] font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:mt-7 sm:text-[1.7rem] xl:text-[1.95rem] 2xl:text-[2.15rem]">
                  {card.title}
                </h3>

                <p className="mt-3 max-w-[34ch] text-[0.98rem] leading-[1.75] tracking-[-0.025em] text-(--app-text-soft) sm:mt-4 sm:text-[1rem] sm:leading-[1.85]">
                  {card.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
