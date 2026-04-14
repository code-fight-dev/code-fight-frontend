import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Fira_Code,
  IBM_Plex_Mono,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { ViewerSessionProvider } from "@/entities/viewer";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { getPreferencesInitScript, PreferencesProvider } from "@/features/preferences";
import { getPreferencesServer } from "@/features/preferences/server";
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

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-editor-fira",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-editor-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeFight App",
  description: "A platform for coding challenges and competitions.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [initialViewer, initialPreferences] = await Promise.all([
    getCurrentViewerServer(),
    getPreferencesServer(),
  ]);

  return (
    <html
      lang="en"
      data-theme={initialPreferences.theme}
      data-motion={initialPreferences.motion}
      suppressHydrationWarning
    >
      <head>
        <script
          id="codefight-preferences-init"
          dangerouslySetInnerHTML={{ __html: getPreferencesInitScript() }}
        />
      </head>
      <body
        className={[
          spaceGrotesk.variable,
          ibmPlexMono.variable,
          firaCode.variable,
          jetbrainsMono.variable,
          "min-h-dvh overflow-x-hidden",
        ].join(" ")}
      >
        <PreferencesProvider initialPreferences={initialPreferences}>
          <ViewerSessionProvider initialViewer={initialViewer}>
            <Header />
            <main className="min-h-[calc(100dvh-81px)] pt-20.25">{children}</main>
            <Footer />
          </ViewerSessionProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
