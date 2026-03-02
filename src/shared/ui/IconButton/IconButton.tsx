import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";

type SharedProps = {
  className?: string;
  children?: ReactNode;
  "aria-label": string;
};

type IconButtonAsButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type IconButtonAsLinkProps = SharedProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & {
    href: ComponentPropsWithoutRef<typeof Link>["href"];
  };

type Props = IconButtonAsButtonProps | IconButtonAsLinkProps;

export function IconButton(props: Props) {
  const { className, children, ...restProps } = props;

  const iconButtonClassName = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[var(--app-control-ghost-text)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-focus-ring-offset)] hover:border-[color:var(--app-control-ghost-hover-border)] hover:bg-[var(--app-control-ghost-hover-bg)] hover:text-[var(--app-control-ghost-hover-text)] hover:shadow-[0_10px_30px_rgba(37,99,235,0.12)]",
    className,
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkProps } = restProps as Omit<
      IconButtonAsLinkProps,
      "className" | "children"
    >;

    return (
      <Link href={href} className={iconButtonClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = restProps as Omit<
    IconButtonAsButtonProps,
    "className" | "children"
  >;

  return (
    <button type={type} className={iconButtonClassName} {...buttonProps}>
      {children}
    </button>
  );
}
