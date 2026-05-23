import Link from "next/link";
import { Compass } from "lucide-react";
import type { DocsPageData } from "../../model/types";
import { DocsSectionHeading } from "../DocsSectionHeading";

type Props = Readonly<{
  data: DocsPageData;
}>;

export function GettingStartedSection({ data }: Props) {
  return (
    <section
      id="getting-started"
      className="app-shell-card scroll-mt-32 rounded-[30px] px-5 py-6 sm:px-6 sm:py-7"
    >
      <DocsSectionHeading
        icon={Compass}
        kicker="Flow"
        title="Getting Started"
        description="Recommended sequence for onboarding new players and validating core product flows."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {data.gettingStartedSteps.map((step, index) => (
          <article
            key={step.id}
            className="app-shell-card-soft rounded-2xl border border-white/8 px-4 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-accent text-[11px] tracking-[0.2em] text-blue-200 uppercase">
                Step {(index + 1).toString().padStart(2, "0")}
              </span>
              <Link
                href={step.href}
                className="rounded-lg border border-white/12 bg-white/4 px-2.5 py-1 text-[12px] font-semibold text-(--app-text-soft) transition-colors hover:border-blue-300/35 hover:bg-blue-500/14 hover:text-(--app-text-strong)"
              >
                {step.ctaLabel}
              </Link>
            </div>

            <h3 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
              {step.title}
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-(--app-text-muted)">
              {step.summary}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
