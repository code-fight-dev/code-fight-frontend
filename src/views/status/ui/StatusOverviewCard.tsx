import Link from "next/link";
import { Reveal } from "@/shared/ui/Reveal";
import type { StatusPageData } from "../model/types";
import { statusIndicatorVisuals } from "./statusPageStyles";

type Props = {
  isAvailable: StatusPageData["isAvailable"];
  indicator: StatusPageData["indicator"];
  indicatorDescription: StatusPageData["indicatorDescription"];
  sourceName: StatusPageData["sourceName"];
  publicStatusPageUrl: StatusPageData["publicStatusPageUrl"];
};

export function StatusOverviewCard({
  isAvailable,
  indicator,
  indicatorDescription,
  sourceName,
  publicStatusPageUrl,
}: Props) {
  const indicatorStyles = statusIndicatorVisuals[indicator];
  const title = indicatorDescription || indicatorStyles.label;
  const sourceLabel = !isAvailable
    ? "Status information is currently unavailable."
    : sourceName
      ? `Source: ${sourceName}`
      : "Source is not provided by status service.";

  return (
    <Reveal delay={90} className="mt-10">
      <section
        className={`rounded-3xl border px-6 py-6 shadow-sm backdrop-blur ${indicatorStyles.cardClassName}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${indicatorStyles.dotClassName}`} />
              <h2 className="font-accent text-2xl font-semibold tracking-[-0.04em]">
                {title}
              </h2>
            </div>

            <p className="mt-2 text-sm opacity-80">{sourceLabel}</p>
          </div>

          {publicStatusPageUrl ? (
            <Link
              href={publicStatusPageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-current/20 px-5 text-sm font-medium transition-opacity hover:opacity-80"
            >
              Open public status page
            </Link>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}
