import type { Metadata } from "next";
import { RankingPageView } from "@/views/ranking";

export const metadata: Metadata = {
  title: "Ranking | CodeFight",
  description:
    "Explore CodeFight rank tiers, progression milestones, and competitive ladder details.",
  alternates: {
    canonical: "/ranking",
  },
};

export default function RankingPage() {
  return <RankingPageView />;
}
