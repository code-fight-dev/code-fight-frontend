import type { Metadata } from "next";
import { PrivacyPageView } from "@/views/company";

export const metadata: Metadata = {
  title: "Privacy | CodeFight",
  description: "Privacy overview for CodeFight platform users.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyPageView />;
}
