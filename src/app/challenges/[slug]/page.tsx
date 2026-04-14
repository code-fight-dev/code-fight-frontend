import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengeWorkspace } from "@/views/challenges";
import { getChallengeBySlug, getChallengeSlugs } from "@/views/challenges/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getChallengeSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await getChallengeBySlug(slug);

  if (!challenge) {
    return {
      title: "Challenge not found | CodeFight",
    };
  }

  return {
    title: `${challenge.title} | CodeFight Challenges`,
    description: challenge.summary,
  };
}

export default async function ChallengeDetailPage({ params }: Props) {
  const { slug } = await params;
  const challenge = await getChallengeBySlug(slug);

  if (!challenge) {
    notFound();
  }

  return <ChallengeWorkspace challenge={challenge} />;
}
