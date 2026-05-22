"use client";

import { getRankByRating } from "@/entities/rank";
import { useViewerSession } from "@/entities/viewer";
import type { ViewerProfile } from "@/entities/viewer";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import { formatJoinedDate } from "@/views/viewer-profile/model/format";
import { EloHistoryChart } from "@/views/viewer-profile/ui/EloHistoryChart";
import { ProfileSummary } from "@/views/viewer-profile/ui/ProfileSummary";
import { RankProgression } from "@/views/viewer-profile/ui/RankProgression";
import { RecentMatches } from "@/views/viewer-profile/ui/RecentMatches";
import { StatsCards } from "@/views/viewer-profile/ui/StatsCards";
import { TopLanguages } from "@/views/viewer-profile/ui/TopLanguages";

type Props = {
  profile: ViewerProfile;
};

export function ViewerProfilePageView({ profile }: Props) {
  const { viewer } = useViewerSession();
  const isOwner =
    viewer?.id === profile.id ||
    viewer?.username.toLowerCase() === profile.username.toLowerCase();
  const currentRank = getRankByRating(profile.stats.eloRating);

  return (
    <section className="app-profile-page relative overflow-hidden py-10 sm:py-12 lg:py-16">
      <div
        aria-hidden
        className="app-motion-decorative app-profile-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_86%_14%,rgba(34,211,238,0.07),transparent_20%),linear-gradient(180deg,transparent,rgba(8,12,24,0.2)_100%)]"
      />
      <div
        aria-hidden
        className="app-motion-decorative app-profile-grid pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.56)_0.7px,transparent_0.8px)] mask-[linear-gradient(180deg,transparent,black_12%,black_88%,transparent)] bg-size-[30px_30px] opacity-[0.08]"
      />

      <Container className="relative">
        <Reveal>
          <ProfileSummary
            profile={profile}
            rankTier={currentRank.tier}
            rankColor={currentRank.color}
            joinedLabel={formatJoinedDate(profile.createdAt)}
            isOwner={Boolean(isOwner)}
          />
        </Reveal>

        <Reveal className="mt-6" delay={70}>
          <StatsCards stats={profile.stats} />
        </Reveal>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.58fr)_minmax(320px,0.82fr)]">
          <div className="space-y-6">
            <EloHistoryChart
              points={profile.eloHistory}
              accentColor={currentRank.color}
            />
            <RecentMatches matches={profile.recentMatches} />
          </div>

          <div className="space-y-6">
            <RankProgression
              rating={profile.stats.eloRating}
              country={profile.country}
              countryCode={profile.countryCode}
              globalRank={profile.stats.globalRank}
              globalPlayersCount={profile.stats.globalPlayersCount}
              regionalRank={profile.stats.regionalRank}
              regionalPlayersCount={profile.stats.regionalPlayersCount}
            />
            <TopLanguages languages={profile.topLanguages} />
          </div>
        </div>
      </Container>
    </section>
  );
}
