import { LeaderboardAvatar } from "@/entities/leaderboard";
import type { ArenaPageData } from "../model/getArenaPageData";
import { getViewerCardPresentation } from "../model/presentation";

type Props = {
  viewer: ArenaPageData["viewer"];
  isGuest: boolean;
};

export function ArenaUserCard({ viewer, isGuest }: Props) {
  const presentation = getViewerCardPresentation(viewer, isGuest);

  return (
    <article className="arena-card arena-user-card challenge-panel rounded-2xl px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LeaderboardAvatar
            avatarUrl={viewer.avatarUrl}
            username={presentation.username}
            imageSize={44}
            className="arena-avatar h-11 w-11 rounded-xl text-[13px]"
          />
          <div>
            <div className="text-[15px] font-semibold text-(--app-text-strong)">
              {presentation.username}
            </div>
            <div className="text-[12px] leading-4 text-(--app-text-faint)">
              {presentation.details}
            </div>
          </div>
        </div>
        <div
          className="arena-user-tier rounded-lg px-2.5 py-1 text-[12px] font-semibold"
          style={presentation.tierStyle}
        >
          {presentation.tierLabel}
        </div>
      </div>
    </article>
  );
}
