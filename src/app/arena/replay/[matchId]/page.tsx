import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { ArenaReplayRoomPageView } from "@/views/arena-replay-room";

type Props = {
  params: Promise<{
    matchId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Arena Replay | CodeFight",
  description: "Watch completed coding duels with timeline playback.",
};

export default async function ArenaReplayPage({ params }: Props) {
  const viewer = await getCurrentViewerServer();
  if (!viewer) {
    redirect("/signin");
  }

  const { matchId } = await params;

  return <ArenaReplayRoomPageView matchId={matchId} />;
}
