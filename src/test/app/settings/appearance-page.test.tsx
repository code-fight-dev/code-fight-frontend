import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/settings/appearance/page", () => {
  it("renders AppearanceSettingsPanel", async () => {
    const AppearanceSettingsPanelMock = vi.fn(() => (
      <div data-testid="appearance-settings-panel">Appearance panel</div>
    ));

    const { default: AppearanceSettingsPage } = await loadPageModule(
      () => import("@/app/settings/appearance/page"),
      () => {
        vi.doMock("@/features/preferences", () => ({
          AppearanceSettingsPanel: AppearanceSettingsPanelMock,
        }));
      },
    );

    render(<AppearanceSettingsPage />);

    expect(AppearanceSettingsPanelMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("appearance-settings-panel")).toHaveTextContent(
      "Appearance panel",
    );
  });
});
