import type { Metadata } from "next";
import { ArenaPageView } from "@/views/arena";
import { getArenaPageData } from "@/views/arena/server";

export const metadata: Metadata = {
  title: "Arena | CodeFight",
  description: "PVP matchmaking and live coding duels in CodeFight Arena.",
  alternates: {
    canonical: "/arena",
  },
};

export default async function ArenaPage() {
  const data = await getArenaPageData();

  return <ArenaPageView data={data} />;
}
