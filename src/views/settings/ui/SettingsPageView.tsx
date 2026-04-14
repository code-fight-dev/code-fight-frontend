"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import { getSettingsSectionBySegment } from "@/views/settings/model/sections";
import { SettingsContentHeader } from "./SettingsContentHeader";
import { SettingsPageDecor, SettingsShellDecor } from "./SettingsDecor";
import { SettingsSidebar } from "./SettingsSidebar";

type Props = {
  children: ReactNode;
};

export function SettingsPageView({ children }: Props) {
  const selectedSegment = useSelectedLayoutSegment();
  const activeSection = getSettingsSectionBySegment(selectedSegment);

  return (
    <section className="app-settings-page relative overflow-hidden py-10 sm:py-12 lg:py-16">
      <SettingsPageDecor />

      <Container className="relative">
        <Reveal className="mx-auto max-w-6xl">
          <h1 className="text-[2.2rem] font-semibold tracking-[-0.07em] text-(--app-text-strong) sm:text-[2.8rem] lg:text-[3.15rem]">
            Settings
          </h1>
        </Reveal>

        <Reveal className="mx-auto mt-6 max-w-6xl sm:mt-8" delay={80}>
          <div className="app-settings-shell relative overflow-hidden rounded-[34px]">
            <SettingsShellDecor />

            <div className="relative grid lg:grid-cols-[260px_minmax(0,1fr)]">
              <SettingsSidebar activeSectionId={activeSection.id} />

              <div className="px-5 py-6 sm:px-6 lg:px-10 lg:py-8">
                <SettingsContentHeader section={activeSection} />

                <div className="mt-8 lg:mt-10">{children}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
