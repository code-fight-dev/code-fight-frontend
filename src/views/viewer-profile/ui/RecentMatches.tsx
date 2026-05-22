import type { ViewerProfileRecentMatch } from "@/entities/viewer";
import { ProfileSection } from "@/views/viewer-profile/ui/ProfileSection";
import {
  DESKTOP_EMPTY_COPY,
  MOBILE_EMPTY_COPY,
  RECENT_MATCH_COLUMNS,
} from "@/views/viewer-profile/ui/recent-matches/constants";
import { RecentMatchesColumnPills } from "@/views/viewer-profile/ui/recent-matches/RecentMatchesColumnPills";
import { RecentMatchesDesktopTable } from "@/views/viewer-profile/ui/recent-matches/RecentMatchesDesktopTable";
import { RecentMatchesEmptyState } from "@/views/viewer-profile/ui/recent-matches/RecentMatchesEmptyState";
import { RecentMatchesMobileList } from "@/views/viewer-profile/ui/recent-matches/RecentMatchesMobileList";

type Props = {
  matches: ViewerProfileRecentMatch[];
};

export function RecentMatches({ matches }: Props) {
  return (
    <ProfileSection
      title="Recent Matches"
      description="Latest rated and unrated duels from your profile history."
      contentClassName="mt-5"
    >
      <div className="md:hidden">
        <RecentMatchesColumnPills />
        <div className="mt-4">
          {matches.length === 0 ? (
            <RecentMatchesEmptyState description={MOBILE_EMPTY_COPY} />
          ) : (
            <RecentMatchesMobileList matches={matches} />
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <div className="min-w-2xl">
            <div className="grid grid-cols-[1.1fr_1.35fr_1fr_0.8fr_1fr] gap-3 border-b border-white/8 px-1 py-3 text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
              {RECENT_MATCH_COLUMNS.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>

            {matches.length === 0 ? (
              <div className="px-1 py-8">
                <RecentMatchesEmptyState description={DESKTOP_EMPTY_COPY} />
              </div>
            ) : (
              <RecentMatchesDesktopTable matches={matches} />
            )}
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
