"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ViewerProfile } from "@/entities/viewer";
import {
  getLocationCityOptions,
  getLocationCountryOptions,
  getLocationStateOptions,
} from "@/features/profile-settings/api/locationCatalog";
import { getProfileSettingsErrorMessage } from "@/features/profile-settings/model/panelHelpers";
import {
  createProfileSettingsLocationDraft,
  type ProfileSettingsDraft,
} from "@/features/profile-settings/model/profileSettingsForm";
import type { ProfileSettingsTabId } from "@/features/profile-settings/model/tabs";
import { getCountryCodeByName } from "@/shared/lib/country";

type Props = Readonly<{
  activeTab: ProfileSettingsTabId;
  clearSaveFeedback: () => void;
  draft: ProfileSettingsDraft;
  profileState: ViewerProfile;
  setDraft: Dispatch<SetStateAction<ProfileSettingsDraft>>;
}>;

export function useProfileSettingsLocationState({
  activeTab,
  clearSaveFeedback,
  draft,
  profileState,
  setDraft,
}: Props) {
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [loadedStateProvinceOptions, setLoadedStateProvinceOptions] = useState<string[]>(
    [],
  );
  const [loadedCityOptions, setLoadedCityOptions] = useState<string[]>([]);
  const [locationLookupError, setLocationLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== "location" || countryOptions.length > 0) {
      return;
    }

    let isCancelled = false;

    getLocationCountryOptions()
      .then((options) => {
        if (!isCancelled) {
          setCountryOptions(options);
          setLocationLookupError(null);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setLocationLookupError(
            getProfileSettingsErrorMessage(error, "Failed to load countries"),
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTab, countryOptions.length]);

  useEffect(() => {
    if (activeTab !== "location" || !draft.country) {
      return;
    }

    let isCancelled = false;

    getLocationStateOptions(draft.country)
      .then(async (options) => {
        if (isCancelled) {
          return;
        }

        setLoadedStateProvinceOptions(options);
        setLocationLookupError(null);

        if (draft.stateProvince && !options.includes(draft.stateProvince)) {
          setDraft((currentDraft) => ({
            ...currentDraft,
            stateProvince: "",
            city: "",
          }));
          setLoadedCityOptions([]);
          return;
        }

        if (options.length > 0 && !draft.stateProvince) {
          setLoadedCityOptions([]);
          return;
        }

        try {
          const nextCityOptions = await getLocationCityOptions(
            draft.country,
            draft.stateProvince,
          );

          if (isCancelled) {
            return;
          }

          setLoadedCityOptions(nextCityOptions);
          setLocationLookupError(null);

          setDraft((currentDraft) =>
            currentDraft.city && !nextCityOptions.includes(currentDraft.city)
              ? {
                  ...currentDraft,
                  city: "",
                }
              : currentDraft,
          );
        } catch (error) {
          if (!isCancelled) {
            setLocationLookupError(
              getProfileSettingsErrorMessage(error, "Failed to load cities"),
            );
            setLoadedCityOptions([]);
          }
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setLocationLookupError(
            getProfileSettingsErrorMessage(error, "Failed to load states or provinces"),
          );
          setLoadedStateProvinceOptions([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTab, draft.country, draft.stateProvince, setDraft]);

  function clearLocationFeedback() {
    clearSaveFeedback();
    setLocationLookupError(null);
  }

  function handleCountryChange(value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      country: value,
      countryCode: getCountryCodeByName(value),
      stateProvince: "",
      city: "",
    }));
    clearLocationFeedback();
    setLoadedStateProvinceOptions([]);
    setLoadedCityOptions([]);
  }

  function handleStateProvinceChange(value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      stateProvince: value,
      city: "",
    }));
    clearLocationFeedback();
    setLoadedCityOptions([]);
  }

  function resetLocation() {
    const nextLocationDraft = createProfileSettingsLocationDraft(profileState);

    setDraft((currentDraft) => ({
      ...currentDraft,
      ...nextLocationDraft,
    }));
    if (!nextLocationDraft.country) {
      setLoadedStateProvinceOptions([]);
      setLoadedCityOptions([]);
    }
    clearLocationFeedback();
  }

  const stateProvinceOptions = draft.country ? loadedStateProvinceOptions : [];
  const cityOptions =
    !draft.country || (stateProvinceOptions.length > 0 && !draft.stateProvince)
      ? []
      : loadedCityOptions;

  return {
    cityOptions,
    countryOptions,
    handleCountryChange,
    handleStateProvinceChange,
    locationLookupError,
    resetLocation,
    stateProvinceOptions,
  };
}
