import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewerProfilePageView } from "@/views/viewer-profile";
import { getViewerProfilePageData } from "@/views/viewer-profile/server";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    return {
      title: "Profile | CodeFight",
    };
  }

  return {
    title: `@${normalizedUsername} | CodeFight`,
    description: `Public CodeFight profile for @${normalizedUsername}.`,
    alternates: {
      canonical: `/u/${encodeURIComponent(normalizedUsername)}`,
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getViewerProfilePageData(username);

  if (!profile) {
    notFound();
  }

  return <ViewerProfilePageView profile={profile} />;
}
