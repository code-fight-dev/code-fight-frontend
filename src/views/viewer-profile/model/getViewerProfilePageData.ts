import "server-only";

import { getViewerProfile } from "@/entities/viewer";

export async function getViewerProfilePageData(username: string) {
  return getViewerProfile(username);
}
