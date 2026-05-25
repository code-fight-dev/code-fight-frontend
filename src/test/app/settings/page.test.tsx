import { describe, expect, it, vi } from "vitest";

import { SETTINGS_PROFILE_HREF } from "@/shared/config/routes";
import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/settings/page", () => {
  it("redirects to profile settings entrypoint", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });

    const { default: SettingsPage } = await loadPageModule(
      () => import("@/app/settings/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
      },
    );

    expect(() => SettingsPage()).toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith(SETTINGS_PROFILE_HREF);
  });
});
