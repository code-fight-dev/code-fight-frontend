import Link from "next/link";
import { buildViewerProfileHref } from "@/shared/config/routes";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import type { LeaderboardEntry } from "../model/types";
import { LeaderboardAvatar } from "./LeaderboardAvatar";

type Props = {
  entry: LeaderboardEntry;
  isViewer?: boolean;
};

export function PlayerIdentity({ entry, isViewer = false }: Props) {
  const locationLabel = entry.country.trim();
  const usernameLabel = entry.username.trim();
  const hasCountryFlag = entry.countryCode.trim() !== "";
  const hasMetaLine = isViewer || hasCountryFlag || locationLabel !== "";

  return (
    <div className="flex min-w-max items-center gap-3">
      <LeaderboardAvatar
        avatarUrl={entry.avatarUrl}
        username={entry.username}
        imageSize={36}
        className="h-9 w-9 rounded-xl text-[13px]"
      />

      <div className="min-w-max">
        <Link
          href={buildViewerProfileHref(entry.username)}
          title={entry.displayName}
          className="-mx-1 inline-flex w-fit max-w-none cursor-pointer rounded-md px-1 py-0.5 text-[14px] leading-tight font-semibold tracking-[-0.02em] whitespace-nowrap text-(--app-text-strong) underline decoration-transparent underline-offset-2 transition-[color,background-color,box-shadow,text-decoration-color] duration-150 hover:bg-sky-500/20 hover:text-sky-100 hover:decoration-sky-200 hover:shadow-[0_0_0_1px_rgba(125,211,252,0.62)]"
        >
          {entry.displayName}
        </Link>

        {usernameLabel ? (
          <div className="mt-0.5 text-[12px] leading-tight whitespace-nowrap text-(--app-text-muted)">
            @{usernameLabel}
          </div>
        ) : null}

        {hasMetaLine ? (
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] text-(--app-text-faint)">
            {isViewer ? (
              <span className="shrink-0 rounded-full border border-blue-300/45 bg-blue-400/14 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-blue-200 uppercase">
                you
              </span>
            ) : null}
            {hasCountryFlag ? (
              <CountryFlag
                countryCode={entry.countryCode}
                countryName={entry.country}
                className="h-3.5 w-5 rounded-[3px]"
              />
            ) : null}
            {locationLabel ? <span className="truncate">{locationLabel}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
