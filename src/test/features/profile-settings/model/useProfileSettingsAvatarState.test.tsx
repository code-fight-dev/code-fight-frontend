import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProfileSettingsAvatarState } from "@/features/profile-settings/model/useProfileSettingsAvatarState";
import {
  createProfileSettingsDraftFixture,
  createViewerProfileFixture,
} from "./fixtures";

const avatarStateMocks = vi.hoisted(() => ({
  validateAvatarFile: vi.fn(),
  readAvatarFile: vi.fn(),
}));

vi.mock("@/entities/viewer", async () => {
  const actual = await vi.importActual("@/entities/viewer");
  return {
    ...actual,
    validateAvatarFile: avatarStateMocks.validateAvatarFile,
    readAvatarFile: avatarStateMocks.readAvatarFile,
  };
});

describe("features/profile-settings/model/useProfileSettingsAvatarState", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    avatarStateMocks.validateAvatarFile.mockReturnValue(null);
    avatarStateMocks.readAvatarFile.mockResolvedValue("data:image/png;base64,default");
  });

  it("resets photo to profile fallback values and clears feedback", () => {
    const clearSaveFeedback = vi.fn();
    const setDraft = vi.fn();
    const profileState = createViewerProfileFixture({
      avatarUrl: "",
      providerAvatarUrl: "https://example.com/provider.png",
      avatarSource: "custom",
    });

    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback,
        profileState,
        setDraft,
      }),
    );

    act(() => {
      result.current.resetPhoto();
    });

    expect(clearSaveFeedback).toHaveBeenCalledTimes(1);
    const updater = setDraft.mock.calls[0]?.[0] as
      | ((draft: ReturnType<typeof createProfileSettingsDraftFixture>) => unknown)
      | undefined;
    expect(updater?.(createProfileSettingsDraftFixture())).toMatchObject({
      avatarUrl: "https://example.com/provider.png",
      avatarSource: "provider",
      pendingAvatarFile: null,
      removeCustomAvatar: false,
    });
  });

  it("resets photo to persisted custom avatar when profile has custom url", () => {
    const setDraft = vi.fn();
    const profileState = createViewerProfileFixture({
      avatarUrl: "https://example.com/custom.png",
      avatarSource: "custom",
      providerAvatarUrl: "https://example.com/provider.png",
    });

    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback: vi.fn(),
        profileState,
        setDraft,
      }),
    );

    act(() => {
      result.current.resetPhoto();
    });

    const updater = setDraft.mock.calls[0]?.[0] as
      | ((draft: ReturnType<typeof createProfileSettingsDraftFixture>) => unknown)
      | undefined;
    expect(updater?.(createProfileSettingsDraftFixture())).toMatchObject({
      avatarUrl: "https://example.com/custom.png",
      avatarSource: "custom",
    });
  });

  it("does nothing for null file except clearing save feedback", async () => {
    avatarStateMocks.validateAvatarFile.mockReturnValue(null);
    avatarStateMocks.readAvatarFile.mockResolvedValue("data:image/png;base64,AA");

    const clearSaveFeedback = vi.fn();
    const setDraft = vi.fn();
    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback,
        profileState: createViewerProfileFixture(),
        setDraft,
      }),
    );

    await act(async () => {
      await result.current.handleAvatarFileChange(null);
    });

    expect(clearSaveFeedback).toHaveBeenCalledTimes(1);
    expect(avatarStateMocks.validateAvatarFile).not.toHaveBeenCalled();
    expect(avatarStateMocks.readAvatarFile).not.toHaveBeenCalled();
    expect(setDraft).not.toHaveBeenCalled();
  });

  it("shows validation error and does not read invalid avatar file", async () => {
    avatarStateMocks.validateAvatarFile.mockReturnValue("Invalid avatar file");

    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback: vi.fn(),
        profileState: createViewerProfileFixture(),
        setDraft: vi.fn(),
      }),
    );

    const file = new File(["avatar"], "avatar.txt", { type: "text/plain" });

    await act(async () => {
      await result.current.handleAvatarFileChange(file);
    });

    expect(result.current.avatarError).toBe("Invalid avatar file");
    expect(avatarStateMocks.readAvatarFile).not.toHaveBeenCalled();
  });

  it("reads valid avatar file and updates draft state", async () => {
    avatarStateMocks.validateAvatarFile.mockReturnValue(null);
    avatarStateMocks.readAvatarFile.mockResolvedValue("data:image/png;base64,avatar");

    const setDraft = vi.fn();
    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback: vi.fn(),
        profileState: createViewerProfileFixture(),
        setDraft,
      }),
    );

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    await act(async () => {
      await result.current.handleAvatarFileChange(file);
    });

    await waitFor(() => {
      expect(setDraft).toHaveBeenCalledTimes(1);
    });

    const updater = setDraft.mock.calls[0]?.[0] as
      | ((draft: ReturnType<typeof createProfileSettingsDraftFixture>) => unknown)
      | undefined;
    expect(updater?.(createProfileSettingsDraftFixture())).toMatchObject({
      avatarUrl: "data:image/png;base64,avatar",
      avatarSource: "custom",
      pendingAvatarFile: file,
      removeCustomAvatar: false,
    });
    expect(result.current.avatarError).toBeNull();
  });

  it("maps file read failures to fallback error message and can clear it", async () => {
    avatarStateMocks.validateAvatarFile.mockReturnValue(null);
    avatarStateMocks.readAvatarFile.mockRejectedValue("boom");

    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback: vi.fn(),
        profileState: createViewerProfileFixture(),
        setDraft: vi.fn(),
      }),
    );

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    await act(async () => {
      await result.current.handleAvatarFileChange(file);
    });

    expect(result.current.avatarError).toBe("Failed to read avatar file");

    act(() => {
      result.current.clearAvatarError();
    });
    expect(result.current.avatarError).toBeNull();
  });

  it("removes custom avatar and chooses provider fallback", () => {
    const clearSaveFeedback = vi.fn();
    const setDraft = vi.fn();
    const profileState = createViewerProfileFixture({
      avatarSource: "custom",
      providerAvatarUrl: "https://example.com/provider.png",
    });

    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback,
        profileState,
        setDraft,
      }),
    );

    act(() => {
      result.current.handleRemoveCustomAvatar();
    });

    expect(clearSaveFeedback).toHaveBeenCalledTimes(1);

    const updater = setDraft.mock.calls[0]?.[0] as
      | ((draft: ReturnType<typeof createProfileSettingsDraftFixture>) => unknown)
      | undefined;
    expect(updater?.(createProfileSettingsDraftFixture())).toMatchObject({
      avatarUrl: "https://example.com/provider.png",
      avatarSource: "provider",
      pendingAvatarFile: null,
      removeCustomAvatar: true,
    });
  });

  it("does not request custom avatar removal when profile avatar is not custom", () => {
    const setDraft = vi.fn();
    const profileState = createViewerProfileFixture({
      avatarSource: "provider",
      providerAvatarUrl: "https://example.com/provider.png",
    });

    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback: vi.fn(),
        profileState,
        setDraft,
      }),
    );

    act(() => {
      result.current.handleRemoveCustomAvatar();
    });

    const updater = setDraft.mock.calls[0]?.[0] as
      | ((draft: ReturnType<typeof createProfileSettingsDraftFixture>) => unknown)
      | undefined;
    expect(updater?.(createProfileSettingsDraftFixture())).toMatchObject({
      removeCustomAvatar: false,
    });
  });

  it("falls back to derived avatar source when profile avatar source is malformed", () => {
    const setDraft = vi.fn();
    const profileState = {
      ...createViewerProfileFixture({
        providerAvatarUrl: "https://example.com/provider.png",
      }),
      avatarSource: "",
    } as unknown as ReturnType<typeof createViewerProfileFixture>;

    const { result } = renderHook(() =>
      useProfileSettingsAvatarState({
        clearSaveFeedback: vi.fn(),
        profileState,
        setDraft,
      }),
    );

    act(() => {
      result.current.resetPhoto();
    });

    const updater = setDraft.mock.calls[0]?.[0] as
      | ((draft: ReturnType<typeof createProfileSettingsDraftFixture>) => unknown)
      | undefined;
    expect(updater?.(createProfileSettingsDraftFixture())).toMatchObject({
      avatarSource: "provider",
    });
  });
});
