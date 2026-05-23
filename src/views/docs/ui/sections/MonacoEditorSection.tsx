import { Check, Settings2, TerminalSquare } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import type { DocsPageData } from "../../model/types";
import { DocsMonacoSnippet } from "../DocsMonacoSnippet";
import { DocsSectionHeading } from "../DocsSectionHeading";

type Props = Readonly<{
  data: DocsPageData;
}>;

export function MonacoEditorSection({ data }: Props) {
  return (
    <section
      id="monaco-editor"
      className="app-shell-card scroll-mt-32 rounded-[30px] px-5 py-6 sm:px-6 sm:py-7"
    >
      <DocsSectionHeading
        icon={TerminalSquare}
        kicker="Workspace"
        title={data.monacoGuide.title}
        description={data.monacoGuide.description}
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="challenge-code-block rounded-2xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-accent text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
              Monaco Preview
            </p>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-(--app-text-soft)">
              TypeScript
            </span>
          </div>
          <DocsMonacoSnippet
            fileName="editor-preview.ts"
            value={data.monacoGuide.previewSnippet}
          />
        </article>

        <div className="grid gap-3">
          <article className="app-shell-card-soft rounded-2xl border border-white/8 px-4 py-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/24 bg-blue-500/12 px-2.5 py-1">
              <Settings2 className="h-3.5 w-3.5 text-blue-200" strokeWidth={2} />
              <span className="font-accent text-[11px] tracking-[0.16em] text-blue-100 uppercase">
                Capabilities
              </span>
            </div>
            <ul className="mt-3 grid gap-2.5">
              {data.monacoGuide.capabilities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-(--app-text-muted)"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="app-shell-card-soft rounded-2xl border border-white/8 px-4 py-4">
            <div className="font-accent text-[11px] tracking-[0.18em] text-blue-200 uppercase">
              Setup Flow
            </div>
            <ol className="mt-3 grid gap-2">
              {data.monacoGuide.setupSteps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-[13px] text-(--app-text-muted)"
                >
                  <span className="font-accent mr-2 text-[11px] tracking-[0.16em] text-blue-100 uppercase">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="leading-6">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4">
              <Button
                href={data.monacoGuide.settingsHref}
                className="min-h-10 w-full rounded-xl px-4 text-[13px] sm:w-auto"
              >
                Open Editor Settings
              </Button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
