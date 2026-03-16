import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { SettingsPageView } from "@/views/settings";

type Props = {
  children: ReactNode;
};

export default async function SettingsLayout({ children }: Props) {
  const viewer = await getCurrentViewerServer();

  if (!viewer) {
    redirect("/signin");
  }

  return <SettingsPageView>{children}</SettingsPageView>;
}
