import { Reveal } from "@/shared/ui/Reveal";

export function StatusPageHero() {
  return (
    <Reveal className="max-w-3xl">
      <p className="text-[14px] font-medium tracking-[-0.02em] text-(--app-text-soft)">
        System status
      </p>

      <h1 className="font-accent mt-3 text-4xl font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:text-5xl">
        CodeFight Status
      </h1>

      <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] tracking-[-0.02em] text-(--app-text-soft) sm:text-[16px]">
        Live availability information for CodeFight core services.
      </p>
    </Reveal>
  );
}
