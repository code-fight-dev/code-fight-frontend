import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProfileSettingsLocationState } from "@/features/profile-settings/model/useProfileSettingsLocationState";
import type { ProfileSettingsTabId } from "@/features/profile-settings/model/tabs";
import {
  createProfileSettingsDraftFixture,
  createViewerProfileFixture,
} from "./fixtures";
import { createDeferred } from "@/test/helpers/deferred";

const locationStateMocks = vi.hoisted(() => ({
  getLocationCountryOptions: vi.fn(),
  getLocationStateOptions: vi.fn(),
  getLocationCityOptions: vi.fn(),
  getCountryCodeByName: vi.fn(),
}));

vi.mock("@/features/profile-settings/api/locationCatalog", () => ({
  getLocationCountryOptions: locationStateMocks.getLocationCountryOptions,
  getLocationStateOptions: locationStateMocks.getLocationStateOptions,
  getLocationCityOptions: locationStateMocks.getLocationCityOptions,
}));

vi.mock("@/shared/lib/country", async () => {
  const actual = await vi.importActual("@/shared/lib/country");
  return {
    ...actual,
    getCountryCodeByName: locationStateMocks.getCountryCodeByName,
  };
});

type HookProps = {
  activeTab: ProfileSettingsTabId;
  clearSaveFeedback: () => void;
  initialDraft: ReturnType<typeof createProfileSettingsDraftFixture>;
  profileState: ReturnType<typeof createViewerProfileFixture>;
};

function renderLocationStateHook(props: HookProps) {
  return renderHook(
    ({ activeTab, clearSaveFeedback, initialDraft, profileState }: HookProps) => {
      const [draft, setDraft] = useState(initialDraft);
      const value = useProfileSettingsLocationState({
        activeTab,
        clearSaveFeedback,
        draft,
        profileState,
        setDraft,
      });

      return {
        ...value,
        draft,
      };
    },
    {
      initialProps: props,
    },
  );
}

describe("features/profile-settings/model/useProfileSettingsLocationState", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    locationStateMocks.getLocationCountryOptions.mockResolvedValue([]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue([]);
    locationStateMocks.getLocationCityOptions.mockResolvedValue([]);
    locationStateMocks.getCountryCodeByName.mockImplementation((countryName: string) => {
      if (countryName === "Canada") {
        return "CA";
      }
      if (countryName === "United States") {
        return "US";
      }
      return "";
    });
  });

  it("loads country options only on location tab", async () => {
    locationStateMocks.getLocationCountryOptions.mockResolvedValue([
      "Canada",
      "United States",
    ]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue([]);

    const clearSaveFeedback = vi.fn();
    const nonLocation = renderLocationStateHook({
      activeTab: "bio",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture(),
      profileState: createViewerProfileFixture(),
    });

    expect(locationStateMocks.getLocationCountryOptions).not.toHaveBeenCalled();

    nonLocation.rerender({
      activeTab: "location",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture(),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(nonLocation.result.current.countryOptions).toEqual([
        "Canada",
        "United States",
      ]);
    });
  });

  it("exposes country lookup errors", async () => {
    locationStateMocks.getLocationCountryOptions.mockRejectedValueOnce(
      new Error("Country lookup failed"),
    );
    locationStateMocks.getLocationStateOptions.mockResolvedValue([]);

    const { result } = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback: vi.fn(),
      initialDraft: createProfileSettingsDraftFixture({
        country: "",
        stateProvince: "",
        city: "",
      }),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(result.current.locationLookupError).toBe("Country lookup failed");
    });

    locationStateMocks.getLocationCountryOptions.mockRejectedValueOnce("boom");
    const second = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback: vi.fn(),
      initialDraft: createProfileSettingsDraftFixture({
        country: "",
        stateProvince: "",
        city: "",
      }),
      profileState: createViewerProfileFixture(),
    });
    await waitFor(() => {
      expect(second.result.current.locationLookupError).toBe("Failed to load countries");
    });
  });

  it("loads states and cities for selected location and clears invalid city", async () => {
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue([
      "California",
      "New York",
    ]);
    locationStateMocks.getLocationCityOptions.mockResolvedValue([
      "San Diego",
      "San Francisco",
    ]);

    const { result } = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback: vi.fn(),
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "California",
        city: "Unknown City",
      }),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(result.current.stateProvinceOptions).toEqual(["California", "New York"]);
      expect(result.current.cityOptions).toEqual(["San Diego", "San Francisco"]);
      expect(result.current.draft.city).toBe("");
    });
  });

  it("clears invalid state and city when selected state is not available", async () => {
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue([
      "California",
      "New York",
    ]);

    const { result } = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback: vi.fn(),
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "Texas",
        city: "Austin",
      }),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(result.current.draft.stateProvince).toBe("");
      expect(result.current.draft.city).toBe("");
      expect(result.current.cityOptions).toEqual([]);
    });

    expect(locationStateMocks.getLocationCityOptions).not.toHaveBeenCalled();
  });

  it("does not fetch city list when states exist but state is not selected", async () => {
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue(["California"]);

    const { result } = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback: vi.fn(),
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "",
        city: "",
      }),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(result.current.stateProvinceOptions).toEqual(["California"]);
      expect(result.current.cityOptions).toEqual([]);
    });

    expect(locationStateMocks.getLocationCityOptions).not.toHaveBeenCalled();
  });

  it("exposes state and city lookup errors", async () => {
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockRejectedValueOnce(
      new Error("State lookup failed"),
    );

    const stateError = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback: vi.fn(),
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
      }),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(stateError.result.current.locationLookupError).toBe("State lookup failed");
      expect(stateError.result.current.stateProvinceOptions).toEqual([]);
    });

    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue(["California"]);
    locationStateMocks.getLocationCityOptions.mockRejectedValueOnce("boom");

    const cityError = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback: vi.fn(),
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "California",
      }),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(cityError.result.current.locationLookupError).toBe("Failed to load cities");
      expect(cityError.result.current.cityOptions).toEqual([]);
    });
  });

  it("handles country and state changes and resets location draft", async () => {
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue(["California"]);

    const clearSaveFeedback = vi.fn();
    const profileState = createViewerProfileFixture({
      country: "",
      countryCode: "",
      stateProvince: "",
      city: "",
    });

    const { result } = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        countryCode: "US",
        stateProvince: "California",
        city: "San Francisco",
      }),
      profileState,
    });

    await waitFor(() => {
      expect(result.current.stateProvinceOptions).toEqual(["California"]);
    });

    act(() => {
      result.current.handleCountryChange("Canada");
    });

    expect(result.current.draft).toMatchObject({
      country: "Canada",
      countryCode: "CA",
      stateProvince: "",
      city: "",
    });
    expect(clearSaveFeedback).toHaveBeenCalled();

    act(() => {
      result.current.handleStateProvinceChange("Ontario");
    });

    expect(result.current.draft).toMatchObject({
      stateProvince: "Ontario",
      city: "",
    });

    act(() => {
      result.current.resetLocation();
    });

    expect(result.current.draft).toMatchObject({
      country: "",
      countryCode: "",
      stateProvince: "",
      city: "",
    });
    expect(result.current.stateProvinceOptions).toEqual([]);
    expect(result.current.cityOptions).toEqual([]);
  });

  it("ignores in-flight city lookup results after effect cleanup", async () => {
    const cityDeferred = createDeferred<string[]>();
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue(["California"]);
    locationStateMocks.getLocationCityOptions.mockImplementation(
      () => cityDeferred.promise,
    );

    const clearSaveFeedback = vi.fn();
    const hook = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "California",
      }),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(locationStateMocks.getLocationCityOptions).toHaveBeenCalledTimes(1);
    });

    hook.rerender({
      activeTab: "bio",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "California",
      }),
      profileState: createViewerProfileFixture(),
    });

    cityDeferred.resolve(["San Diego"]);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hook.result.current.cityOptions).toEqual([]);
  });

  it("ignores in-flight country lookup results after cleanup", async () => {
    const countryDeferred = createDeferred<string[]>();
    locationStateMocks.getLocationCountryOptions.mockImplementation(
      () => countryDeferred.promise,
    );

    const clearSaveFeedback = vi.fn();
    const hook = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "",
        stateProvince: "",
        city: "",
      }),
      profileState: createViewerProfileFixture(),
    });

    hook.rerender({
      activeTab: "bio",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "",
        stateProvince: "",
        city: "",
      }),
      profileState: createViewerProfileFixture(),
    });

    countryDeferred.resolve(["Canada"]);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hook.result.current.countryOptions).toEqual([]);
    expect(hook.result.current.locationLookupError).toBeNull();
  });

  it("ignores country lookup errors after cleanup", async () => {
    const countryDeferred = createDeferred<string[]>();
    locationStateMocks.getLocationCountryOptions.mockImplementation(
      () => countryDeferred.promise,
    );

    const clearSaveFeedback = vi.fn();
    const hook = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "",
        stateProvince: "",
        city: "",
      }),
      profileState: createViewerProfileFixture(),
    });

    hook.rerender({
      activeTab: "bio",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "",
        stateProvince: "",
        city: "",
      }),
      profileState: createViewerProfileFixture(),
    });

    countryDeferred.reject(new Error("late country failure"));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hook.result.current.locationLookupError).toBeNull();
    expect(hook.result.current.countryOptions).toEqual([]);
  });

  it("ignores city lookup errors after cleanup and keeps existing feedback state", async () => {
    const cityDeferred = createDeferred<string[]>();
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue(["California"]);
    locationStateMocks.getLocationCityOptions.mockImplementation(
      () => cityDeferred.promise,
    );

    const clearSaveFeedback = vi.fn();
    const hook = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "California",
      }),
      profileState: createViewerProfileFixture(),
    });

    await waitFor(() => {
      expect(locationStateMocks.getLocationCityOptions).toHaveBeenCalledTimes(1);
    });

    hook.rerender({
      activeTab: "bio",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "California",
      }),
      profileState: createViewerProfileFixture(),
    });

    cityDeferred.reject(new Error("late city failure"));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hook.result.current.locationLookupError).toBeNull();
  });

  it("ignores state lookup errors after cleanup", async () => {
    const stateDeferred = createDeferred<string[]>();
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockImplementation(
      () => stateDeferred.promise,
    );

    const clearSaveFeedback = vi.fn();
    const hook = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
      }),
      profileState: createViewerProfileFixture(),
    });

    hook.rerender({
      activeTab: "bio",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
      }),
      profileState: createViewerProfileFixture(),
    });

    stateDeferred.reject(new Error("late state failure"));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hook.result.current.locationLookupError).toBeNull();
    expect(hook.result.current.stateProvinceOptions).toEqual([]);
  });

  it("resets location without clearing cached options when profile already has a country", async () => {
    locationStateMocks.getLocationCountryOptions.mockResolvedValue(["United States"]);
    locationStateMocks.getLocationStateOptions.mockResolvedValue(["California"]);
    locationStateMocks.getLocationCityOptions.mockResolvedValue(["San Francisco"]);

    const clearSaveFeedback = vi.fn();
    const profileState = createViewerProfileFixture({
      country: "United States",
      countryCode: "US",
      stateProvince: "California",
      city: "San Francisco",
    });

    const { result } = renderLocationStateHook({
      activeTab: "location",
      clearSaveFeedback,
      initialDraft: createProfileSettingsDraftFixture({
        country: "United States",
        stateProvince: "California",
        city: "San Diego",
      }),
      profileState,
    });

    await waitFor(() => {
      expect(result.current.stateProvinceOptions).toEqual(["California"]);
    });

    act(() => {
      result.current.resetLocation();
    });

    expect(result.current.draft).toMatchObject({
      country: "United States",
      countryCode: "US",
      stateProvince: "California",
      city: "San Francisco",
    });
    expect(result.current.stateProvinceOptions).toEqual(["California"]);
  });
});
