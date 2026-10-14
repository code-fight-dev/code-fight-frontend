import type { ReactNode } from "react";
import { ViewerSessionProvider } from "@/entities/viewer";
import { createViewerFixture } from "@/test/fixtures/viewer";

const viewer = createViewerFixture("organizer", { role: "organizer" });

export function ManagementSession({ children }: { children: ReactNode }) {
  return <ViewerSessionProvider initialViewer={viewer}>{children}</ViewerSessionProvider>;
}
