import Image from "next/image";
import {
  getAvatarAlt,
  getProfileInitial,
  shouldBypassAvatarOptimization,
} from "@/entities/viewer";
import { cn } from "@/shared/lib/cn";

type Props = {
  avatarUrl: string;
  username: string;
  className?: string;
  imageSize: number;
};

export function LeaderboardAvatar({ avatarUrl, username, className, imageSize }: Props) {
  const hasAvatar = avatarUrl.trim() !== "";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/12 bg-white/6 font-semibold text-(--app-text-strong)",
        className,
      )}
    >
      {hasAvatar ? (
        <Image
          src={avatarUrl}
          alt={getAvatarAlt(username)}
          fill
          sizes={`${imageSize}px`}
          unoptimized={shouldBypassAvatarOptimization(avatarUrl)}
          className="object-cover"
        />
      ) : (
        getProfileInitial(username)
      )}
    </span>
  );
}
