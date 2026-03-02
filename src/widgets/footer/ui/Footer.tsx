import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Logo } from "@/shared/ui/Logo";
import { Reveal } from "@/shared/ui/Reveal";
import { FOOTER_COLUMNS } from "../model/links";
import { FooterSocialLinks } from "./FooterSocialLinks";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-(--app-header-border-soft) bg-(--app-surface-footer)">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -left-16 h-72 w-80 rounded-full bg-[#1d4ed8]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -bottom-10 h-64 w-72 rounded-full bg-[#2563eb]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_26%),radial-gradient(circle_at_82%_68%,rgba(59,130,246,0.09),transparent_22%)]"
      />

      <Container className="relative flex flex-col pt-16 pb-8 sm:pt-18 sm:pb-10 lg:min-h-94.5 lg:pt-20">
        <div className="grid gap-10 md:gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,2fr)] lg:gap-16">
          <Reveal className="space-y-5">
            <Logo />
            <p className="max-w-lg text-[14px] leading-[1.7] tracking-[-0.02em] text-(--app-text-soft) sm:text-[15px] 2xl:max-w-xl 2xl:text-[16px]">
              The definitive platform for competitive programming and elite technical
              assessment.
            </p>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:gap-12">
            {FOOTER_COLUMNS.map((column, index) => (
              <Reveal key={column.title} delay={index * 90}>
                <h2 className="font-accent text-[14px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
                  {column.title}
                </h2>
                <ul className="mt-5 space-y-3.5 sm:mt-6 sm:space-y-4">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[14px] tracking-[-0.02em] text-(--app-text-soft) transition-colors hover:text-(--app-text-strong) sm:text-[15px] 2xl:text-[16px]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-(--app-header-border-soft) pt-6 text-(--app-text-faint) sm:mt-12 sm:flex-row sm:items-center sm:justify-between lg:mt-auto">
          <p className="text-[13px] tracking-[-0.02em] sm:text-[14px]">
            © {currentYear} Competitive Arena. All rights reserved.
          </p>

          <FooterSocialLinks />
        </div>
      </Container>
    </footer>
  );
}
