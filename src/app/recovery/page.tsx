import type { Metadata } from "next";
import { RecoveryPageView } from "@/views/recovery";

export const metadata: Metadata = {
  title: "Password Recovery | CodeFight",
  description: "Recover access to your CodeFight account.",
  alternates: {
    canonical: "/recovery",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RecoveryPage() {
  return <RecoveryPageView />;
}
