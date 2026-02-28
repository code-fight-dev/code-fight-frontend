import { Container } from "@/shared/ui/Container";
import { cn } from "@/shared/lib/cn";
import { Reveal } from "@/shared/ui/Reveal";
import type { PlatformStat } from "../model/types";

type Props = {
  stats: PlatformStat[];
};

const badgeToneClasses: Record<PlatformStat["badgeTone"], string> = {
  success:
    "border border-emerald-500/10 bg-emerald-500/12 text-emerald-300 shadow-[0_12px_30px_rgba(16,185,129,0.08)]",
  info: "border border-blue-500/14 bg-blue-500/12 text-blue-300 shadow-[0_12px_30px_rgba(37,99,235,0.08)]",
};

export function PlatformStats({ stats }: Props) {
  return (
    <section className="relative border-y border-white/6 bg-[linear-gradient(180deg,rgba(7,11,21,0.94)_0%,rgba(7,10,19,0.98)_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(37,99,235,0.08),transparent_24%),radial-gradient(circle_at_84%_100%,rgba(37,99,235,0.08),transparent_22%)]"
      />

      <Container className="relative">
        <div className="grid md:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.id}
              delay={index * 90}
              className={cn(
                "flex min-h-28 items-center py-6 sm:min-h-31 sm:py-7",
                index > 0 &&
                  "border-t border-white/6 md:border-t-0 md:border-l md:border-white/6 md:pl-8 lg:pl-12",
                index === 0 && "md:pr-8 lg:pr-12",
              )}
            >
              <div>
                <div className="font-accent text-[12px] font-semibold tracking-[0.18em] text-white/34 uppercase">
                  {stat.label}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="text-[1.9rem] font-semibold tracking-[-0.06em] text-white/92 sm:text-[2.2rem] xl:text-[2.45rem] 2xl:text-[2.8rem]">
                    {stat.value}
                  </div>

                  <span
                    className={cn(
                      "font-accent inline-flex rounded-md px-2.5 py-1 text-[12px] font-semibold tracking-[-0.03em]",
                      badgeToneClasses[stat.badgeTone],
                    )}
                  >
                    {stat.badge}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
