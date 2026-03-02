import { Container } from "@/shared/ui/Container";
import type { HeroSnapshot } from "../model/types";
import { HeroContent } from "./HeroContent";
import { HeroPreview } from "./HeroPreview";

type Props = {
  snapshot: HeroSnapshot;
};

export function Hero({ snapshot }: Props) {
  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_88%_88%,rgba(29,78,216,0.12),transparent_22%)]" />
        <div className="absolute inset-y-0 left-[22%] w-px bg-[linear-gradient(180deg,transparent,var(--app-grid-line),transparent)]" />
        <div className="absolute -right-10 -bottom-30 h-80 w-80 rounded-full bg-[#2563eb]/8 blur-3xl" />
      </div>

      <Container className="relative flex min-h-[calc(100svh-81px)] items-center py-12 sm:py-14 md:py-16 xl:h-[calc(100dvh-81px)] xl:py-16 2xl:py-20">
        <div className="grid w-full items-center gap-12 md:gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-10 xl:gap-14 2xl:gap-20">
          <HeroContent snapshot={snapshot} />
          <HeroPreview />
        </div>
      </Container>
    </section>
  );
}
