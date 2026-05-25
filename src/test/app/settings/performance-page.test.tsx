import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/settings/performance/page", () => {
  it("renders PerformanceSettingsPanel", async () => {
    const PerformanceSettingsPanelMock = vi.fn(() => (
      <div data-testid="performance-settings-panel">Performance panel</div>
    ));

    const { default: PerformanceSettingsPage } = await loadPageModule(
      () => import("@/app/settings/performance/page"),
      () => {
        vi.doMock("@/features/preferences", () => ({
          PerformanceSettingsPanel: PerformanceSettingsPanelMock,
        }));
      },
    );

    render(<PerformanceSettingsPage />);

    expect(PerformanceSettingsPanelMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("performance-settings-panel")).toHaveTextContent(
      "Performance panel",
    );
  });
});
