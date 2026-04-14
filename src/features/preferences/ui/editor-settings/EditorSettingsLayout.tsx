import type { ReactNode } from "react";

type EditorSettingsSectionCardProps = Readonly<{
  children: ReactNode;
}>;

export function EditorSettingsSectionCard({ children }: EditorSettingsSectionCardProps) {
  return (
    <section className="app-settings-section rounded-3xl p-4 sm:p-5 lg:p-6">
      {children}
    </section>
  );
}

type EditorSettingsSectionHeadingProps = Readonly<{
  description: string;
  title: string;
}>;

export function EditorSettingsSectionHeading({
  description,
  title,
}: EditorSettingsSectionHeadingProps) {
  return (
    <div className="max-w-2xl px-1">
      <h2 className="text-base font-semibold text-(--app-text-strong) sm:text-lg">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-(--app-text-muted)">{description}</p>
    </div>
  );
}
