import type { SettingsSection } from "@/views/settings/model/sections";

type Props = Readonly<{
  section: SettingsSection;
}>;

export function SettingsContentHeader({ section }: Props) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-[1.95rem] font-semibold tracking-[-0.07em] text-(--app-text-strong) sm:text-[2.35rem]">
        {section.label}
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-[1.68] tracking-[-0.03em] text-(--app-text-muted) sm:text-[16px]">
        {section.description}
      </p>
    </div>
  );
}
