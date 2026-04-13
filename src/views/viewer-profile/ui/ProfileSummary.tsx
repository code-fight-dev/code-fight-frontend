import Image from "next/image";
import { CalendarDays, MapPin, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  getAvatarAlt,
  getProfileInitial,
  shouldBypassAvatarOptimization,
  shouldShowGeneratedAvatar,
} from "@/entities/viewer";
import type { ViewerProfile } from "@/entities/viewer";
import { SETTINGS_PROFILE_HREF } from "@/shared/config/routes";
import { Button } from "@/shared/ui/Button";

type Props = {
  profile: ViewerProfile;
  rankTier: string;
  rankColor: string;
  joinedLabel: string;
  isOwner: boolean;
};

export function ProfileSummary({
  profile,
  rankTier,
  rankColor,
  joinedLabel,
  isOwner,
}: Props) {
  const showGeneratedAvatar = shouldShowGeneratedAvatar(
    profile.avatarUrl,
    profile.avatarSource,
  );
  const locationLabel = [profile.city, profile.stateProvince, profile.country]
    .filter(Boolean)
    .join(", ");
  const displayName = profile.displayName || profile.username;

  return (
    <section className="app-shell-card profile-card-solid relative overflow-hidden rounded-[34px] p-5 sm:p-6 lg:p-7">
      <div
        aria-hidden
        className="app-profile-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.16),transparent_26%),radial-gradient(circle_at_88%_16%,rgba(6,182,212,0.08),transparent_18%),linear-gradient(180deg,transparent,rgba(8,12,24,0.22)_100%)]"
      />
      <div
        aria-hidden
        className="app-profile-grid pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.56)_0.7px,transparent_0.8px)] mask-[linear-gradient(180deg,transparent,black_12%,black_88%,transparent)] bg-size-[28px_28px] opacity-[0.06]"
      />

      <div className="relative grid items-start gap-7 xl:grid-cols-[180px_minmax(0,1fr)]">
        <div className="flex w-fit flex-col items-center justify-self-center">
          <div className="relative">
            <div className="app-avatar-display-glow absolute inset-0 rounded-[34px] blur-xl" />

            <div className="app-avatar-display-frame relative flex h-30 w-30 items-center justify-center overflow-hidden rounded-[30px] sm:h-34 sm:w-34">
              {showGeneratedAvatar ? (
                <div className="flex h-full w-full items-center justify-center bg-white text-[2.6rem] font-semibold tracking-[-0.08em] text-slate-900 sm:text-[3rem]">
                  {getProfileInitial(profile.username)}
                </div>
              ) : (
                <Image
                  src={profile.avatarUrl}
                  alt={getAvatarAlt(profile.username)}
                  fill
                  preload
                  unoptimized={shouldBypassAvatarOptimization(profile.avatarUrl)}
                  sizes="160px"
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {isOwner ? (
            <div className="mt-4 flex w-full justify-center">
              <Button
                href={SETTINGS_PROFILE_HREF}
                className="min-h-10 w-full rounded-full px-4.5 text-[12px] shadow-[0_0_0_1px_rgba(59,130,246,0.28),0_10px_24px_rgba(37,99,235,0.16)] sm:w-auto"
              >
                <Settings2 className="h-4 w-4" strokeWidth={1.9} />
                Edit Profile
              </Button>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 text-center xl:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 xl:justify-start">
            <h1 className="text-[2.1rem] font-semibold tracking-[-0.075em] text-(--app-text-strong) sm:text-[2.85rem]">
              {displayName}
            </h1>
            <span
              className="inline-flex items-center rounded-[14px] border px-3 py-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase"
              style={{
                color: rankColor,
                borderColor: `${rankColor}4f`,
                background: `linear-gradient(180deg, ${rankColor}1f 0%, ${rankColor}12 100%)`,
                boxShadow: `0 0 0 1px ${rankColor}18, 0 12px 28px ${rankColor}18`,
              }}
            >
              {rankTier} Tier
            </span>
          </div>

          <p className="mt-2 text-[14px] tracking-[-0.03em] text-(--app-text-soft)">
            @{profile.username}
          </p>

          <p className="mt-5 max-w-3xl text-[15px] leading-[1.72] tracking-[-0.03em] wrap-anywhere wrap-break-word text-(--app-text-muted) sm:text-[16px]">
            {profile.bio || "This player has not added a public bio yet."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 xl:justify-start">
            {locationLabel ? (
              <MetaChip icon={<MapPin className="h-4 w-4" strokeWidth={1.95} />}>
                {locationLabel}
              </MetaChip>
            ) : null}
            <MetaChip icon={<CalendarDays className="h-4 w-4" strokeWidth={1.95} />}>
              Joined {joinedLabel}
            </MetaChip>
          </div>
        </div>
      </div>
    </section>
  );
}

type MetaChipProps = {
  icon: ReactNode;
  children: ReactNode;
};

function MetaChip({ icon, children }: MetaChipProps) {
  return (
    <div className="app-profile-meta-chip inline-flex max-w-full items-center justify-center gap-2 rounded-2xl px-3.5 py-2.5 text-[13px] font-medium tracking-[-0.02em] sm:justify-start">
      <span className="app-profile-meta-chip-icon">{icon}</span>
      <span className="min-w-0 wrap-anywhere wrap-break-word">{children}</span>
    </div>
  );
}
