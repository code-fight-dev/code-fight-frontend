import type { ComponentType } from "react";

type Props = Readonly<{
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  kicker: string;
  title: string;
}>;

export function DocsSectionHeading({ icon: Icon, kicker, title, description }: Props) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5">
        <Icon className="h-3.5 w-3.5 text-blue-300" strokeWidth={2} />
        <span className="font-accent text-[11px] tracking-[0.18em] text-blue-200 uppercase">
          {kicker}
        </span>
      </div>

      <h2 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:text-[2rem]">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-[14px] leading-7 tracking-[-0.02em] text-(--app-text-muted) sm:text-[15px]">
        {description}
      </p>
    </div>
  );
}
