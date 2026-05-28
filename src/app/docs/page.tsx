import type { Metadata } from "next";
import { DocsPageView } from "@/views/docs";
import { getDocsPageData } from "@/views/docs/server";

export const metadata: Metadata = {
  title: "Documentation | CodeFight",
  description: "Guides, API reference, and platform workflows for CodeFight.",
  alternates: {
    canonical: "/docs",
  },
};

export default async function DocumentationPage() {
  const data = await getDocsPageData();

  return <DocsPageView data={data} />;
}
