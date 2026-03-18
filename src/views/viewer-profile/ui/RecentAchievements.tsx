import { ProfileSection } from "./ProfileSection";

export function RecentAchievements() {
  return (
    <ProfileSection title="Recent Achievements">
      <div className="rounded-3xl border border-dashed border-white/12 bg-white/3 px-4 py-5">
        <p className="text-[15px] leading-[1.72] tracking-[-0.025em] text-(--app-text-muted)">
          We&apos;ll be adding lots of achievements soon!
        </p>
      </div>
    </ProfileSection>
  );
}
