import { Cable } from "lucide-react";
import type { DocsApiEndpoint, DocsPageData } from "../../model/types";
import { DocsMonacoSnippet } from "../DocsMonacoSnippet";
import { DocsSectionHeading } from "../DocsSectionHeading";

type Props = Readonly<{
  data: DocsPageData;
}>;

const methodClassNameByMethod: Record<DocsApiEndpoint["method"], string> = {
  GET: "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
  POST: "border-blue-400/30 bg-blue-400/12 text-blue-200",
  PUT: "border-amber-400/30 bg-amber-400/12 text-amber-200",
  PATCH: "border-violet-400/30 bg-violet-400/12 text-violet-200",
  DELETE: "border-rose-400/30 bg-rose-400/12 text-rose-200",
};

export function ApiReferenceSection({ data }: Props) {
  return (
    <section
      id="api-reference"
      className="app-shell-card scroll-mt-32 rounded-[30px] px-5 py-6 sm:px-6 sm:py-7"
    >
      <DocsSectionHeading
        icon={Cable}
        kicker="Integration"
        title="API Reference"
        description="Public endpoints currently exposed by the frontend app layer."
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="challenge-code-block rounded-2xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-accent text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
              Example Request
            </p>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-(--app-text-soft)">
              TypeScript
            </span>
          </div>
          <DocsMonacoSnippet fileName="api-health.ts" value={data.apiSnippet} />
        </article>

        <div className="grid gap-3">
          {data.apiEndpoints.map((endpoint) => (
            <article
              key={endpoint.path}
              className="app-shell-card-soft rounded-2xl border border-white/8 px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${methodClassNameByMethod[endpoint.method]}`}
                >
                  {endpoint.method}
                </span>
                <span className="font-accent text-[13px] text-(--app-text-strong)">
                  {endpoint.path}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-(--app-text-soft)">
                  {endpoint.auth}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-6 text-(--app-text-muted)">
                {endpoint.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
