import { notFound } from "next/navigation";
import { ViewerProfilePageView } from "@/views/viewer-profile";
import { getViewerProfilePageData } from "@/views/viewer-profile/server";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getViewerProfilePageData(username);

  if (!profile) {
    notFound();
  }

  return <ViewerProfilePageView profile={profile} />;
}
