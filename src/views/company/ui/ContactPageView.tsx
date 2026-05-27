import { ArrowUpRight, Bug, Github, MessageSquareMore, Wrench } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { CompanyPageShell } from "./CompanyPageShell";

export function ContactPageView() {
  return (
    <CompanyPageShell
      activePage="contact"
      kicker="Company"
      title="Contact"
      description="The best way to reach our team today is through GitHub. We monitor updates, bug reports, and contribution ideas there."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="app-shell-card-soft rounded-3xl p-5 sm:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[1.3rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
                Reach us on GitHub
              </h2>
              <p className="mt-2 max-w-140 text-[15px] leading-[1.7] tracking-[-0.02em] text-(--app-text-soft)">
                Follow the organization, check active repositories, and open issues or
                discussions where relevant. That is the fastest channel for
                project-related communication.
              </p>
            </div>

            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
              <Github className="h-5 w-5" strokeWidth={2.1} />
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button
              href="https://github.com/code-fight-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11.5 rounded-2xl px-4 text-[14px]"
            >
              Open Organization
              <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={2.1} />
            </Button>
          </div>
        </article>

        <article className="app-shell-card-soft rounded-3xl p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
            <Bug className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
          <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            Bug Reports
          </h3>
          <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
            Include clear steps, expected behavior, actual behavior, and screenshots if
            possible. Reproducible reports help us fix issues faster.
          </p>
        </article>

        <article className="app-shell-card-soft rounded-3xl p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
            <Wrench className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
          <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            Feature Ideas
          </h3>
          <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
            Tell us what problem you want to solve and how you imagine the workflow. Good
            ideas usually start from concrete developer pain points.
          </p>
        </article>

        <article className="app-shell-card-soft rounded-3xl p-5 sm:col-span-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
            <MessageSquareMore className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
          <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            Collaboration
          </h3>
          <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
            We are open to collaboration, feedback, and knowledge exchange. If you want to
            contribute, start by following our repositories and opening a discussion.
          </p>
        </article>
      </div>
    </CompanyPageShell>
  );
}
