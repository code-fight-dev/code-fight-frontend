import type { DocsQuickLink } from "../model/types";

type Props = Readonly<{
  links: readonly DocsQuickLink[];
}>;

export function DocsQuickLinksPanel({ links }: Props) {
  return (
    <aside className="app-shell-card-soft rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
      <p className="font-accent text-[11px] tracking-[0.2em] text-blue-300 uppercase">
        On this page
      </p>
      <nav className="mt-3 grid gap-1.5">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-[13px] tracking-[-0.02em] text-(--app-text-soft) transition-colors hover:bg-blue-500/10 hover:text-(--app-text-strong)"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
