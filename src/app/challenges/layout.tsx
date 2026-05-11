import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentViewerServer } from "@/entities/viewer/server";

type Props = {
  children: ReactNode;
};

export default async function ChallengesLayout({ children }: Props) {
  const viewer = await getCurrentViewerServer();

  if (!viewer) {
    redirect("/signin");
  }

  return children;
}
