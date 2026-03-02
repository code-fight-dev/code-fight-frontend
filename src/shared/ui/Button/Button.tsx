import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";

type SharedProps = {
  className?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

type ButtonAsButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLinkProps = SharedProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & {
    href: ComponentPropsWithoutRef<typeof Link>["href"];
  };

type Props = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button(props: Props) {
  const { className, children, variant = "primary", ...restProps } = props;

  const base =
    "font-accent relative inline-flex items-center justify-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-semibold tracking-[-0.03em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-focus-ring-offset)] disabled:pointer-events-none disabled:opacity-60";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    ghost:
      "border border-transparent text-[var(--app-control-ghost-text)] hover:border-[color:var(--app-control-ghost-hover-border)] hover:bg-[var(--app-control-ghost-hover-bg)] hover:text-[var(--app-control-ghost-hover-text)] hover:shadow-[0_10px_30px_rgba(37,99,235,0.12)]",
    secondary:
      "border-[color:var(--app-control-secondary-border)] bg-[var(--app-control-secondary-bg)] text-[var(--app-control-secondary-text)] shadow-[0_18px_38px_rgba(3,7,18,0.12)] hover:border-[color:var(--app-control-secondary-hover-border)] hover:bg-[var(--app-control-secondary-hover-bg)] hover:text-[var(--app-control-secondary-hover-text)]",
    primary:
      "border border-blue-400/40 bg-blue-500 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_14px_30px_rgba(37,99,235,0.18)] hover:border-blue-300/60 hover:bg-blue-400 hover:shadow-[0_0_0_1px_rgba(96,165,250,0.45),0_18px_38px_rgba(37,99,235,0.28)] focus-visible:ring-blue-400 " +
      "before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle,rgba(96,165,250,0.35)_0%,rgba(59,130,246,0.14)_48%,transparent_76%)] before:opacity-0 before:blur-xl before:transition-opacity before:duration-200 before:-z-10 hover:before:opacity-100",
  };

  const buttonClassName = cn(base, variants[variant], className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkProps } = restProps as Omit<
      ButtonAsLinkProps,
      "className" | "children" | "variant"
    >;

    return (
      <Link href={href} className={buttonClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = restProps as Omit<
    ButtonAsButtonProps,
    "className" | "children" | "variant"
  >;

  return (
    <button type={type} className={buttonClassName} {...buttonProps}>
      {children}
    </button>
  );
}
