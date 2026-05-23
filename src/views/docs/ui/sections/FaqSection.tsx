import { ShieldCheck } from "lucide-react";
import type { DocsPageData } from "../../model/types";
import { DocsSectionHeading } from "../DocsSectionHeading";

type Props = Readonly<{
  data: DocsPageData;
}>;

export function FaqSection({ data }: Props) {
  return (
    <section
      id="faq"
      className="app-shell-card scroll-mt-32 rounded-[30px] px-5 py-6 sm:px-6 sm:py-7"
    >
      <DocsSectionHeading
        icon={ShieldCheck}
        kicker="Support"
        title="Frequently Asked Questions"
        description="Quick answers for common operational and product questions."
      />

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {data.faqEntries.map((entry) => (
          <article
            key={entry.id}
            className="app-shell-card-soft rounded-2xl border border-white/8 px-4 py-4"
          >
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-(--app-text-strong)">
              {entry.question}
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-(--app-text-muted)">
              {entry.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
