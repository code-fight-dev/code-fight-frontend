import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { ArenaMatchRoomPageView } from "@/views/arena-match-room";

type Props = {
  params: Promise<{
    matchId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Arena Match | CodeFight",
  description: "Live arena duel room for head-to-head coding matches.",
};

export default async function ArenaMatchPage({ params }: Props) {
  const viewer = await getCurrentViewerServer();
  if (!viewer) {
    redirect("/signin");
  }

  const { matchId } = await params;

  return <ArenaMatchRoomPageView matchId={matchId} />;
}
