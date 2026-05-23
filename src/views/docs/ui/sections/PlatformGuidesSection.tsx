import Link from "next/link";
import { Code2 } from "lucide-react";
import type { DocsPageData } from "../../model/types";
import { DocsSectionHeading } from "../DocsSectionHeading";

type Props = Readonly<{
  data: DocsPageData;
}>;

export function PlatformGuidesSection({ data }: Props) {
  return (
    <section
      id="platform-guides"
      className="app-shell-card scroll-mt-32 rounded-[30px] px-5 py-6 sm:px-6 sm:py-7"
    >
      <DocsSectionHeading
        icon={Code2}
        kicker="Guides"
        title="Platform Guides"
        description="High-level technical overview of each product area and what to validate in your environment."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {data.guideCards.map((card) => (
          <article
            key={card.id}
            className="app-shell-card-soft rounded-2xl border border-white/8 px-4 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-accent text-[11px] tracking-[0.2em] text-blue-200 uppercase">
                {card.meta}
              </span>
              <Link
                href={card.href}
                className="rounded-lg border border-white/12 bg-white/4 px-2.5 py-1 text-[12px] font-semibold text-(--app-text-soft) transition-colors hover:border-blue-300/35 hover:bg-blue-500/14 hover:text-(--app-text-strong)"
              >
                Open
              </Link>
            </div>

            <h3 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
              {card.title}
            </h3>

            <ul className="mt-3 grid gap-2">
              {card.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2 text-[13px] text-(--app-text-muted)"
                >
                  <span
                    aria-hidden
                    className="mt-1.75 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300"
                  />
                  <span className="leading-6">{bullet}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
