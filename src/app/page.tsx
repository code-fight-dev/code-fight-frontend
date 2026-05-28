import type { Metadata } from "next";
import { HomePage } from "@/views/home";
import { getHomePageData } from "@/views/home/server";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "CodeFight",
  description:
    "Practice coding challenges, climb rankings, and duel in live coding arena matches.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const data = await getHomePageData();

  return <HomePage data={data} />;
}
