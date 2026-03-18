import { notFound, redirect } from "next/navigation";
import { getViewerProfile } from "@/entities/viewer";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { ProfileSettingsPanel } from "@/features/profile-settings";

export default async function ProfileSettingsPage() {
  const viewer = await getCurrentViewerServer();

  if (!viewer) {
    redirect("/signin");
  }

  const profile = await getViewerProfile(viewer.username);

  if (!profile) {
    notFound();
  }

  return <ProfileSettingsPanel profile={profile} />;
}
