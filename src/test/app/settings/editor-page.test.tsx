import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/settings/editor/page", () => {
  it("renders EditorSettingsPanel", async () => {
    const EditorSettingsPanelMock = vi.fn(() => (
      <div data-testid="editor-settings-panel">Editor panel</div>
    ));

    const { default: SettingsEditorPage } = await loadPageModule(
      () => import("@/app/settings/editor/page"),
      () => {
        vi.doMock("@/features/preferences", () => ({
          EditorSettingsPanel: EditorSettingsPanelMock,
        }));
      },
    );

    render(<SettingsEditorPage />);

    expect(EditorSettingsPanelMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("editor-settings-panel")).toHaveTextContent("Editor panel");
  });
});
