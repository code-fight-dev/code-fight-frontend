import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ViewerProfile } from "@/entities/viewer";
import {
  PROFILE_SETTINGS_SAVE_INDICATOR_DELAY_MS,
  PROFILE_SETTINGS_SAVE_INDICATOR_MIN_VISIBLE_MS,
  PROFILE_SETTINGS_TOAST_DURATION_MS,
} from "@/features/profile-settings/model/constants";
import type { ProfileSettingsDraft } from "@/features/profile-settings/model/profileSettingsForm";
import { useProfileSettingsPanel } from "@/features/profile-settings/model/useProfileSettingsPanel";
import { createDeferred } from "@/test/helpers/deferred";
import { createViewerProfileFixture } from "./fixtures";

const profilePanelMocks = vi.hoisted(() => ({
  updateViewerProfile: vi.fn(),
  updateViewerAvatar: vi.fn(),
  clearAvatarError: vi.fn(),
  useProfileSettingsLocationState: vi.fn(),
}));

vi.mock("@/entities/viewer", async () => {
  const actual = await vi.importActual("@/entities/viewer");
  return {
    ...actual,
    updateViewerProfile: profilePanelMocks.updateViewerProfile,
    updateViewerAvatar: profilePanelMocks.updateViewerAvatar,
  };
});

vi.mock("@/features/profile-settings/model/useProfileSettingsAvatarState", () => ({
  useProfileSettingsAvatarState: ({
    clearSaveFeedback,
    setDraft,
  }: {
    clearSaveFeedback: () => void;
    profileState: ViewerProfile;
    setDraft: (updater: (draft: ProfileSettingsDraft) => unknown) => void;
  }) => ({
    avatarError: null,
    clearAvatarError: profilePanelMocks.clearAvatarError,
    handleAvatarFileChange: async (file: File | null) => {
      clearSaveFeedback();
      if (!file) {
        return;
      }

      setDraft((draft) => ({
        ...draft,
        avatarUrl: "data:image/png;base64,avatar",
        avatarSource: "custom",
        pendingAvatarFile: file,
        removeCustomAvatar: false,
      }));
    },
    handleRemoveCustomAvatar: () => {
      clearSaveFeedback();
      setDraft((draft) => ({
        ...draft,
        pendingAvatarFile: null,
        removeCustomAvatar: true,
      }));
    },
    resetPhoto: () => {
      clearSaveFeedback();
      setDraft((draft) => ({
        ...draft,
        pendingAvatarFile: null,
        removeCustomAvatar: false,
      }));
    },
  }),
}));

vi.mock("@/features/profile-settings/model/useProfileSettingsLocationState", () => ({
  useProfileSettingsLocationState: profilePanelMocks.useProfileSettingsLocationState,
}));

function createLocationHookState(
  overrides: Partial<ReturnType<typeof defaultLocationHook>> = {},
) {
  return {
    ...defaultLocationHook(),
    ...overrides,
  };
}

function defaultLocationHook() {
  return {
    cityOptions: ["San Francisco"],
    countryOptions: ["United States", "Canada"],
    handleCountryChange: vi.fn(),
    handleStateProvinceChange: vi.fn(),
    locationLookupError: null,
    resetLocation: vi.fn(),
    stateProvinceOptions: ["California"],
  };
}

describe("features/profile-settings/model/useProfileSettingsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profilePanelMocks.updateViewerAvatar.mockResolvedValue(createViewerProfileFixture());
    profilePanelMocks.updateViewerProfile.mockResolvedValue(createViewerProfileFixture());
    profilePanelMocks.useProfileSettingsLocationState.mockImplementation(() =>
      createLocationHookState(),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns tab props and allows switching active tab", () => {
    const { result } = renderHook(() =>
      useProfileSettingsPanel(createViewerProfileFixture()),
    );

    expect(result.current.tabsProps.activeTab).toBe("display-name");
    expect(result.current.tabsProps.summaries["display-name"]).toBe("Alice");

    act(() => {
      result.current.tabsProps.onTabChange("bio");
    });

    expect(result.current.tabsProps.activeTab).toBe("bio");
  });

  it("updates city, resets display name, and resets bio fields", () => {
    const { result } = renderHook(() =>
      useProfileSettingsPanel(createViewerProfileFixture()),
    );

    act(() => {
      result.current.displayNameSectionProps.onDisplayNameChange("Edited Name");
      result.current.bioSectionProps.onBioChange("Edited Bio");
      result.current.locationSectionProps.onCityChange("Los Angeles");
    });

    expect(result.current.displayNameSectionProps.displayName).toBe("Edited Name");
    expect(result.current.bioSectionProps.bio).toBe("Edited Bio");
    expect(result.current.locationSectionProps.city).toBe("Los Angeles");

    act(() => {
      result.current.displayNameSectionProps.onReset();
      result.current.bioSectionProps.onReset();
    });

    expect(result.current.displayNameSectionProps.displayName).toBe("Alice");
    expect(result.current.bioSectionProps.bio).toBe("Practicing algorithms");
  });

  it("saves display name with updateViewerProfile and auto-hides success toast", async () => {
    vi.useFakeTimers();

    const updatedProfile = createViewerProfileFixture({
      displayName: "Alice Updated",
    });
    profilePanelMocks.updateViewerProfile.mockResolvedValue(updatedProfile);

    const { result } = renderHook(() =>
      useProfileSettingsPanel(createViewerProfileFixture()),
    );

    act(() => {
      result.current.displayNameSectionProps.onDisplayNameChange("Alice Updated");
    });
    act(() => {
      result.current.displayNameSectionProps.onSave();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(profilePanelMocks.updateViewerProfile).toHaveBeenCalledTimes(1);
    expect(profilePanelMocks.updateViewerProfile).toHaveBeenCalledWith("alice", {
      displayName: "Alice Updated",
      bio: "Practicing algorithms",
      country: "United States",
      countryCode: "US",
      stateProvince: "California",
      city: "San Francisco",
    });
    expect(result.current.toastMessage).toBe("Successfully updated your display name.");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PROFILE_SETTINGS_TOAST_DURATION_MS);
    });
    expect(result.current.toastMessage).toBeNull();
  });

  it("uploads avatar with updateViewerAvatar when pending file exists", async () => {
    const nextProfile = createViewerProfileFixture({
      avatarUrl: "https://example.com/new-avatar.png",
      avatarSource: "custom",
    });
    profilePanelMocks.updateViewerAvatar.mockResolvedValue(nextProfile);

    const { result } = renderHook(() =>
      useProfileSettingsPanel(createViewerProfileFixture()),
    );

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    await act(async () => {
      await result.current.photoSectionProps.onFileChange(file);
    });

    act(() => {
      result.current.photoSectionProps.onSave();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(profilePanelMocks.updateViewerAvatar).toHaveBeenCalledTimes(1);
    });
    expect(profilePanelMocks.updateViewerAvatar).toHaveBeenCalledWith("alice", file);
    expect(profilePanelMocks.updateViewerProfile).not.toHaveBeenCalled();
  });

  it("scopes save errors by target and clears feedback when draft changes", async () => {
    profilePanelMocks.updateViewerProfile.mockRejectedValue(
      new Error("Failed to update bio"),
    );

    const { result } = renderHook(() =>
      useProfileSettingsPanel(createViewerProfileFixture()),
    );

    act(() => {
      result.current.bioSectionProps.onBioChange("New bio");
    });
    act(() => {
      result.current.bioSectionProps.onSave();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.bioSectionProps.errorMessage).toBe("Failed to update bio");
    expect(result.current.displayNameSectionProps.errorMessage).toBeNull();

    act(() => {
      result.current.bioSectionProps.onBioChange("New bio 2");
    });
    expect(result.current.bioSectionProps.errorMessage).toBeNull();
  });

  it("ignores save when there are no changes and prevents concurrent saves", async () => {
    const deferred = createDeferred<ViewerProfile>();
    profilePanelMocks.updateViewerProfile.mockImplementation(() => deferred.promise);

    const { result } = renderHook(() =>
      useProfileSettingsPanel(createViewerProfileFixture()),
    );

    act(() => {
      result.current.displayNameSectionProps.onSave();
    });
    expect(profilePanelMocks.updateViewerProfile).not.toHaveBeenCalled();

    act(() => {
      result.current.displayNameSectionProps.onDisplayNameChange("Alice Updated");
    });
    act(() => {
      result.current.displayNameSectionProps.onSave();
    });

    await waitFor(() => {
      expect(result.current.displayNameSectionProps.isSaving).toBe(true);
    });

    act(() => {
      result.current.displayNameSectionProps.onSave();
    });
    expect(profilePanelMocks.updateViewerProfile).toHaveBeenCalledTimes(1);

    deferred.resolve(createViewerProfileFixture({ displayName: "Alice Updated" }));
    await waitFor(() => {
      expect(result.current.displayNameSectionProps.isSaving).toBe(false);
    });
  });

  it("shows delayed saving indicator and keeps it visible for minimum duration", async () => {
    vi.useFakeTimers();

    const deferred = createDeferred<ViewerProfile>();
    profilePanelMocks.updateViewerProfile.mockImplementation(() => deferred.promise);

    const { result } = renderHook(() =>
      useProfileSettingsPanel(createViewerProfileFixture()),
    );

    act(() => {
      result.current.displayNameSectionProps.onDisplayNameChange("Alice Updated");
    });
    expect(result.current.displayNameSectionProps.hasChanges).toBe(true);

    act(() => {
      result.current.displayNameSectionProps.onSave();
    });

    expect(result.current.displayNameSectionProps.isSavePending).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PROFILE_SETTINGS_SAVE_INDICATOR_DELAY_MS);
    });

    expect(result.current.displayNameSectionProps.isSavePending).toBe(true);

    deferred.resolve(createViewerProfileFixture({ displayName: "Alice Updated" }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.displayNameSectionProps.isSaving).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(
        PROFILE_SETTINGS_SAVE_INDICATOR_MIN_VISIBLE_MS - 1,
      );
    });
    expect(result.current.displayNameSectionProps.isSaving).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.displayNameSectionProps.isSavePending).toBe(false);
    expect(result.current.displayNameSectionProps.isSaving).toBe(false);
  });
});
