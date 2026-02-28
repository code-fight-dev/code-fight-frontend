import { AmbientGrid } from "@/shared/ui/AmbientGrid";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import { NotFoundActions } from "./NotFoundActions";

export function NotFoundPage() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.28),transparent)]"
      />
      <AmbientGrid className="mask-[radial-gradient(circle_at_center,black,transparent_84%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-14 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1d4ed8]/14 blur-3xl sm:h-112 sm:w-md"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -bottom-16 h-72 w-72 rounded-full bg-[#2563eb]/10 blur-3xl"
      />

      <Container className="relative">
        <div className="flex min-h-[calc(100dvh-81px-10rem)] items-center justify-center">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <Reveal
              variant="scale"
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72)_0%,rgba(10,15,28,0.88)_100%)] px-5 py-5 shadow-[0_30px_90px_rgba(3,7,18,0.32)] backdrop-blur-xl sm:max-w-120 sm:px-7 sm:py-6"
            >
              <div className="flex items-end justify-center gap-1.5 sm:gap-2.5">
                <span className="font-accent text-[2.8rem] leading-none font-semibold tracking-[-0.09em] text-white/18 sm:text-[3.9rem]">
                  0x
                </span>
                <span className="font-accent text-[3.2rem] leading-none font-semibold tracking-[-0.09em] text-[#2563eb] sm:text-[4.5rem]">
                  4
                </span>
                <span className="font-accent text-[3.2rem] leading-none font-semibold tracking-[-0.09em] text-white/92 sm:text-[4.5rem]">
                  0
                </span>
                <span className="font-accent text-[3.2rem] leading-none font-semibold tracking-[-0.09em] text-[#2563eb] sm:text-[4.5rem]">
                  4
                </span>
              </div>

              <div className="mt-4 border-t border-white/8 pt-3.5">
                <p className="font-accent text-[10px] font-medium tracking-[0.26em] text-white/38 uppercase sm:text-[11px]">
                  STATUS_NOT_FOUND
                </p>
              </div>
            </Reveal>

            <Reveal delay={80} className="mt-10 max-w-3xl">
              <h1 className="pb-2 text-[2.35rem] leading-[1.1] font-semibold tracking-[-0.06em] text-balance text-white sm:pb-2.5 sm:text-[3.2rem] lg:text-[4.1rem]">
                Sorry,
                <span className="block bg-[linear-gradient(90deg,#7dd3fc_0%,#3b82f6_35%,#2563eb_100%)] bg-clip-text pb-1 text-transparent sm:pb-1.5">
                  Page Not Found
                </span>
              </h1>
            </Reveal>

            <Reveal delay={140} className="mt-5 max-w-2xl">
              <p className="text-[15px] leading-[1.8] tracking-[-0.025em] text-balance text-white/52 sm:text-[17px] lg:text-[18px]">
                This page does not exist or is no longer available. Return home or go back
                to continue.
              </p>
            </Reveal>

            <Reveal delay={200} className="mt-8 w-full max-w-xl sm:mt-10">
              <NotFoundActions />
            </Reveal>

            <Reveal delay={260} className="mt-9 sm:mt-12">
              <p className="font-accent text-[11px] tracking-[0.16em] text-white/30 uppercase sm:text-xs">
                Error Code: <span className="text-white/42">0x404</span>
                <span className="mx-3 text-white/18">|</span>
                HTTP: <span className="text-[#3b82f6]">404</span>
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
