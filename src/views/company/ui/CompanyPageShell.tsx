import Link from "next/link";
import { ArrowUpRight, Github, Megaphone, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { AmbientGrid } from "@/shared/ui/AmbientGrid";
import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";

type CompanyPageId = "about" | "contact" | "privacy";

type CompanyPageShellProps = Readonly<{
  activePage: CompanyPageId;
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}>;

const COMPANY_NAV_LINKS: ReadonlyArray<{
  id: CompanyPageId;
  label: string;
  href: "/about" | "/contact" | "/privacy";
}> = [
  { id: "about", label: "About", href: "/about" },
  { id: "contact", label: "Contact", href: "/contact" },
  { id: "privacy", label: "Privacy", href: "/privacy" },
];

export function CompanyPageShell({
  activePage,
  kicker,
  title,
  description,
  children,
}: CompanyPageShellProps) {
  return (
    <section className="relative overflow-hidden py-10 sm:py-13 lg:py-16">
      <AmbientGrid className="mask-[radial-gradient(circle_at_center,black,transparent_88%)] opacity-66" />

      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute top-0 left-[10%] h-80 w-80 rounded-full bg-[#1d4ed8]/12 blur-3xl"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute right-[4%] -bottom-16 h-88 w-88 rounded-full bg-[#2563eb]/12 blur-3xl"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-y-0 right-[24%] w-px bg-[linear-gradient(180deg,transparent,var(--app-grid-line),transparent)]"
      />

      <Container className="relative">
        <Reveal variant="scale" className="mx-auto max-w-6xl">
          <div className="app-shell-card rounded-[34px] px-5 py-6 sm:px-8 sm:py-8 lg:px-9 lg:py-9">
            <div>
              <p className="font-accent text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
                {kicker}
              </p>
              <h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:text-[2.7rem]">
                {title}
              </h1>
              <p className="mt-3 max-w-180 text-[1rem] leading-[1.72] tracking-[-0.03em] text-(--app-text-soft)">
                {description}
              </p>

              <nav aria-label="Company pages" className="mt-6 flex flex-wrap gap-2.5">
                {COMPANY_NAV_LINKS.map((item) => {
                  const isActive = item.id === activePage;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-[13px] font-medium tracking-[-0.02em] transition-colors duration-200",
                        isActive
                          ? "border-blue-400/40 bg-blue-500/12 text-blue-300"
                          : "border-(--app-surface-soft-border) bg-(--app-surface-soft) text-(--app-text-soft) hover:text-(--app-text-strong)",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <section className="app-shell-card-soft mt-6 rounded-3xl p-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div>
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/28 bg-blue-500/10 text-blue-300">
                        <Megaphone className="h-5 w-5" strokeWidth={2.1} />
                      </span>

                      <div>
                        <h2 className="text-[1.25rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
                          Built in Public
                        </h2>
                        <p className="mt-1.5 text-[14px] leading-[1.7] tracking-[-0.02em] text-(--app-text-soft)">
                          CodeFight is developed by a four-student team with transparent
                          progress and fast release iterations.
                        </p>
                      </div>
                    </div>

                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      <li className="inline-flex items-center gap-2 rounded-2xl border border-(--app-surface-soft-border) bg-(--app-surface-input) px-3.5 py-2 text-[13px] tracking-[-0.02em] text-(--app-text-soft)">
                        <UsersRound
                          className="h-4.5 w-4.5 text-blue-300"
                          strokeWidth={2}
                        />
                        Team size: 4 students
                      </li>
                      <li className="inline-flex items-center gap-2 rounded-2xl border border-(--app-surface-soft-border) bg-(--app-surface-input) px-3.5 py-2 text-[13px] tracking-[-0.02em] text-(--app-text-soft)">
                        <Github className="h-4.5 w-4.5 text-blue-300" strokeWidth={2} />
                        Org: code-fight-dev
                      </li>
                    </ul>
                  </div>

                  <Button
                    href="https://github.com/code-fight-dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-11.5 w-full rounded-2xl text-[14px] lg:w-auto lg:px-4.5"
                  >
                    Visit GitHub Organization
                    <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={2.1} />
                  </Button>
                </div>
              </section>

              <div className="mt-7">{children}</div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
