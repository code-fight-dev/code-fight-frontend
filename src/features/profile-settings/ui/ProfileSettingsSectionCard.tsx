import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Props = Readonly<{
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description: string;
  eyebrow: string;
  eyebrowIcon?: ReactNode;
  title: string;
}>;

export function ProfileSettingsSectionCard({
  children,
  className,
  contentClassName,
  description,
  eyebrow,
  eyebrowIcon,
  title,
}: Props) {
  return (
    <section
      className={cn(
        "app-settings-section overflow-hidden rounded-[30px] p-5 sm:p-6",
        className,
      )}
    >
      <div className="app-settings-kicker flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase">
        {eyebrowIcon}
        {eyebrow}
      </div>

      <h3 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-[1.7] tracking-[-0.03em] text-(--app-text-muted)">
        {description}
      </p>

      <div className={cn("mt-5", contentClassName)}>{children}</div>
    </section>
  );
}
