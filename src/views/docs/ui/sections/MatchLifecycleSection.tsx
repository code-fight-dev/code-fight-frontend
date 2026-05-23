import { Flag } from "lucide-react";
import type { DocsPageData } from "../../model/types";
import { DocsSectionHeading } from "../DocsSectionHeading";

type Props = Readonly<{
  data: DocsPageData;
}>;

export function MatchLifecycleSection({ data }: Props) {
  return (
    <section
      id="match-lifecycle"
      className="app-shell-card scroll-mt-32 rounded-[30px] px-5 py-6 sm:px-6 sm:py-7"
    >
      <DocsSectionHeading
        icon={Flag}
        kicker="Realtime"
        title="Arena Match Lifecycle"
        description="Operational sequence from queue entry to replay review."
      />

      <div className="mt-6 grid gap-3">
        {data.lifecycleSteps.map((step, index) => (
          <article
            key={step.id}
            className="app-shell-card-soft rounded-2xl border border-white/8 px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex w-12 shrink-0 flex-col items-center">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/14 text-[12px] font-semibold text-blue-200">
                  {index + 1}
                </span>
                {index < data.lifecycleSteps.length - 1 ? (
                  <span aria-hidden className="mt-2 h-8 w-px bg-blue-300/24" />
                ) : null}
              </div>

              <div>
                <h3 className="text-[1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
                  {step.title}
                </h3>
                <p className="mt-1 text-[13px] leading-6 text-(--app-text-muted)">
                  {step.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
