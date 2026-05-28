import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { SettingsPageView } from "@/views/settings";

export const metadata: Metadata = {
  title: "Settings | CodeFight",
  description: "Manage your CodeFight account, editor, and appearance preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

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
