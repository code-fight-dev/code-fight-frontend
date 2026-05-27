import type { Metadata } from "next";
import { AboutPageView } from "@/views/company";

export const metadata: Metadata = {
  title: "About | CodeFight",
  description: "Learn how the four-student CodeFight team is building the platform.",
};

export default function AboutPage() {
  return <AboutPageView />;
}
