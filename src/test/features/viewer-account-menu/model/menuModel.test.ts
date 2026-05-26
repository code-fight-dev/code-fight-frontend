import { describe, expect, it } from "vitest";

import {
  getViewerProfileHref,
  VIEWER_SETTINGS_HREF,
} from "@/features/viewer-account-menu/model/getViewerProfileHref";
import { VIEWER_ACCOUNT_MENU_ITEMS } from "@/features/viewer-account-menu/model/items";

describe("features/viewer-account-menu/model", () => {
  it("exposes stable viewer account menu items", () => {
    expect(VIEWER_ACCOUNT_MENU_ITEMS).toEqual([
      { id: "my-profile", label: "My Profile" },
      { id: "settings", label: "Settings" },
      { id: "sign-out", label: "Sign out" },
    ]);
  });

  it("builds encoded profile href", () => {
    expect(getViewerProfileHref("alice")).toBe("/u/alice");
    expect(getViewerProfileHref("alice smith/qa")).toBe("/u/alice%20smith%2Fqa");
  });

  it("re-exports profile settings href", () => {
    expect(VIEWER_SETTINGS_HREF).toBe("/settings/profile");
  });
});
