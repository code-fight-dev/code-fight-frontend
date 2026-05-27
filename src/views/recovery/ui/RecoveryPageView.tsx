import { PasswordRecoveryFlow } from "@/features/password-recovery";
import { AmbientGrid } from "@/shared/ui/AmbientGrid";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";

export function RecoveryPageView() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14 lg:py-18">
      <AmbientGrid className="mask-[radial-gradient(circle_at_center,black,transparent_88%)] opacity-65" />

      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute top-0 left-[8%] h-80 w-80 rounded-full bg-[#1d4ed8]/12 blur-3xl"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute -right-20 -bottom-8 h-96 w-96 rounded-full bg-[#2563eb]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-y-0 left-[18%] w-px bg-[linear-gradient(180deg,transparent,var(--app-grid-line),transparent)]"
      />

      <Container className="relative">
        <div className="flex min-h-[calc(100dvh-81px-5rem)] items-center justify-center">
          <Reveal variant="scale" className="w-full">
            <div className="mx-auto flex w-full max-w-180 flex-col items-center gap-5">
              <BrandMark
                className="h-15 w-15 rounded-[22px] shadow-[0_18px_40px_rgba(37,99,235,0.24)]"
                iconClassName="h-9 w-9"
              />

              <PasswordRecoveryFlow />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
