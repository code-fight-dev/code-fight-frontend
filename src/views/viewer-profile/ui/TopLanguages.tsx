import type { ViewerProfileTopLanguage } from "@/entities/viewer";
import { formatPercent } from "@/views/viewer-profile/model/format";
import { ProfileSection } from "@/views/viewer-profile/ui/ProfileSection";

type Props = {
  languages: ViewerProfileTopLanguage[];
};

export function TopLanguages({ languages }: Props) {
  return (
    <ProfileSection
      title="Top Languages"
      description="Language usage is derived from your submitted solutions."
    >
      {languages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 bg-white/3 px-4 py-5">
          <div className="space-y-4">
            {["Awaiting data", "Awaiting data", "Awaiting data"].map((label, index) => (
              <div key={`${label}-${index}`}>
                <div className="flex items-center justify-between gap-4 text-[14px] font-medium tracking-[-0.03em] text-(--app-text-soft)">
                  <span>{label}</span>
                  <span className="text-(--app-text-faint)">--</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(96,165,250,0.24),rgba(34,211,238,0.12))]"
                    style={{ width: `${42 - index * 8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[13px] leading-[1.68] tracking-[-0.02em] text-(--app-text-muted)">
            Language stats will populate once solution history is available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {languages.map((language) => (
            <div key={language.name}>
              <div className="flex items-center justify-between gap-4 text-[14px] font-medium tracking-[-0.03em] text-(--app-text-strong)">
                <span>{language.name}</span>
                <span className="text-(--app-text-muted)">
                  {formatPercent(language.usageShare, 0)}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]"
                  style={{ width: `${Math.max(language.usageShare * 100, 6)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileSection>
  );
}
