import Link from "next/link";

export function LeaderboardHero() {
  return (
    <section className="relative">
      <div className="px-1 sm:px-2 lg:px-3">
        <div className="font-accent text-[11px] tracking-[0.22em] text-blue-300 uppercase">
          Leaderboard
        </div>

        <h1 className="mt-3 text-[2.3rem] font-semibold tracking-[-0.075em] text-(--app-text-strong) sm:text-[2.9rem] lg:text-[3.2rem]">
          Global Ranking
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] tracking-[-0.03em] text-(--app-text-muted)">
          The sharpest minds across the arena. Climb the rating, claim your spot, and push
          for the top.
        </p>

        <div className="mt-4">
          <Link
            href="/ranking"
            className="inline-flex h-9 items-center rounded-lg border border-white/14 bg-white/5 px-3 text-[12px] font-semibold tracking-[0.14em] text-(--app-text-soft) uppercase transition-colors hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-(--app-text-strong)"
          >
            Rank Guide
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          { label: "Players", value: "—", meta: "coming soon" },
          { label: "Matches Today", value: "—", meta: "coming soon" },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3"
          >
            <div className="text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
              {card.label}
            </div>

            <div className="mt-1 text-[1.8rem] font-semibold tracking-[-0.06em] text-(--app-text-strong)">
              {card.value}
            </div>

            <div className="text-[12px] text-(--app-text-muted)">{card.meta}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
