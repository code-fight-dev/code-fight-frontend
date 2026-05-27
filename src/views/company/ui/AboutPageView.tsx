import { Flag, Layers3, Rocket } from "lucide-react";
import { CompanyPageShell } from "./CompanyPageShell";

export function AboutPageView() {
  return (
    <CompanyPageShell
      activePage="about"
      kicker="Company"
      title="About CodeFight"
      description="We are a team of four students building a competitive coding platform to learn by shipping real infrastructure, real multiplayer features, and real product decisions."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="app-shell-card-soft rounded-3xl p-5 sm:col-span-2">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
            Why we started
          </h2>
          <p className="mt-3 text-[15px] leading-[1.72] tracking-[-0.02em] text-(--app-text-soft)">
            We started CodeFight as a way to challenge ourselves beyond tutorials and
            classroom projects. We wanted a product where frontend, backend, realtime,
            judging infrastructure, and UX all meet in one place.
          </p>
          <p className="mt-3 text-[15px] leading-[1.72] tracking-[-0.02em] text-(--app-text-soft)">
            The goal is simple: build something useful for coders while growing as
            engineers through practical, end-to-end execution.
          </p>
        </article>

        <article className="app-shell-card-soft rounded-3xl p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
            <Rocket className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
          <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            What we are building
          </h3>
          <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
            A fast arena for coding challenges and PvP coding matches, with a focus on
            responsive UX, fair evaluation, and transparent progress.
          </p>
        </article>

        <article className="app-shell-card-soft rounded-3xl p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
            <Layers3 className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
          <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            How we work
          </h3>
          <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
            We ship in small iterations, test continuously, and improve architecture over
            time. Every feature is a chance to learn product thinking and engineering
            craft.
          </p>
        </article>

        <article className="app-shell-card-soft rounded-3xl p-5 sm:col-span-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
            <Flag className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
          <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            What matters to us
          </h3>
          <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
            Clarity over hype, reliability over shortcuts, and learning through real
            responsibility. We are early-stage and still evolving, but we are serious
            about quality and long-term value.
          </p>
        </article>
      </div>
    </CompanyPageShell>
  );
}
