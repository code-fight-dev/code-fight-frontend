import type { Metadata } from "next";
import { ContactPageView } from "@/views/company";

export const metadata: Metadata = {
  title: "Contact | CodeFight",
  description: "Get in touch with the CodeFight team through our public GitHub channels.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactPageView />;
}
