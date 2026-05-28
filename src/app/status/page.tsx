import type { Metadata } from "next";
import { StatusPageView } from "@/views/status";
import { getStatusPageData } from "@/views/status/server";

export const metadata: Metadata = {
  title: "Status | CodeFight",
  description:
    "Current availability, incidents, and uptime information for CodeFight services.",
  alternates: {
    canonical: "/status",
  },
};

export default async function StatusPage() {
  const data = await getStatusPageData();

  return <StatusPageView data={data} />;
}
