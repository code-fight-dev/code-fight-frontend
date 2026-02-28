import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-accent",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CodeFight App",
  description: "A platform for coding challenges and competitions.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} min-h-dvh overflow-x-hidden bg-[#050816] text-white`}
      >
        <Header />
        <main className="min-h-[calc(100dvh-81px)] pt-20.25">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
