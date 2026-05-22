"use client";

import { useSyncExternalStore } from "react";
import { formatRecentMatchFinishedAt } from "@/views/viewer-profile/model/format";

type Props = {
  value: string;
};

export function RecentMatchTimestamp({ value }: Props) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return <>{formatRecentMatchFinishedAt(value, isHydrated ? undefined : "UTC")}</>;
}
