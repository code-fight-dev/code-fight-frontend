import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function ProfileSection({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: Props) {
  return (
    <section
      className={cn(
        "app-shell-card profile-card-solid overflow-hidden rounded-[28px] p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.05em] text-(--app-text-strong) sm:text-[1.55rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-[14px] leading-[1.65] tracking-[-0.02em] text-(--app-text-muted) sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className={cn("mt-6", contentClassName)}>{children}</div>
    </section>
  );
}
