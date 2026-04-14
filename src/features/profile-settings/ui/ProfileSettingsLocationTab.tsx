import { MapPin } from "lucide-react";
import { ProfileSettingsErrorNotice } from "@/features/profile-settings/ui/ProfileSettingsErrorNotice";
import { ProfileSettingsFormActions } from "@/features/profile-settings/ui/ProfileSettingsFormActions";
import { ProfileSettingsSectionCard } from "@/features/profile-settings/ui/ProfileSettingsSectionCard";
import { Select, type SelectOption } from "@/shared/ui/Select";

type Props = {
  country: string;
  stateProvince: string;
  city: string;
  countryOptions: string[];
  stateProvinceOptions: string[];
  cityOptions: string[];
  isSaving: boolean;
  isSavePending: boolean;
  hasChanges: boolean;
  errorMessage: string | null;
  onCountryChange: (value: string) => void;
  onStateProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
};

export function ProfileSettingsLocationTab({
  country,
  stateProvince,
  city,
  countryOptions,
  stateProvinceOptions,
  cityOptions,
  isSaving,
  isSavePending,
  hasChanges,
  errorMessage,
  onCountryChange,
  onStateProvinceChange,
  onCityChange,
  onReset,
  onSave,
}: Props) {
  const hasStateOptions = stateProvinceOptions.length > 0;
  const canChooseCity =
    country !== "" &&
    (!hasStateOptions || stateProvince !== "") &&
    cityOptions.length > 0;

  return (
    <ProfileSettingsSectionCard
      eyebrow="Location"
      eyebrowIcon={<MapPin className="h-4.5 w-4.5" strokeWidth={1.95} />}
      title="Update your location"
      description="Update your location if you want. Countries, states or provinces, and cities are filtered progressively from the selected geography."
      contentClassName="mt-6"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <SelectField
          value={country}
          disabled={isSaving}
          placeholder="Country/Region"
          options={countryOptions}
          onChange={onCountryChange}
        />

        <SelectField
          value={stateProvince}
          disabled={isSaving || country === "" || !hasStateOptions}
          placeholder={
            country === ""
              ? "Choose country first"
              : hasStateOptions
                ? "State/Province"
                : "No state/province data"
          }
          options={stateProvinceOptions}
          onChange={onStateProvinceChange}
        />

        <SelectField
          value={city}
          disabled={isSaving || !canChooseCity}
          placeholder={
            country === ""
              ? "Choose country first"
              : hasStateOptions && stateProvince === ""
                ? "Choose state/province first"
                : cityOptions.length === 0
                  ? "No cities found"
                  : "City/Town"
          }
          options={cityOptions}
          onChange={onCityChange}
        />
      </div>

      <p className="mt-3 text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
        Some countries expose city selection only after a state or province is chosen.
      </p>

      <ProfileSettingsErrorNotice
        message={errorMessage}
        className="mt-5 px-4 py-3 text-[14px]"
      />

      <ProfileSettingsFormActions
        className="mt-6"
        onReset={onReset}
        onSave={onSave}
        isSaving={isSaving}
        isSavePending={isSavePending}
        hasChanges={hasChanges}
      />
    </ProfileSettingsSectionCard>
  );
}

type SelectFieldProps = {
  value: string;
  disabled: boolean;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
};

function SelectField({
  value,
  disabled,
  placeholder,
  options,
  onChange,
}: SelectFieldProps) {
  const selectOptions: SelectOption[] = options.map((option) => ({
    value: option,
    label: option,
  }));

  return (
    <Select
      aria-label={placeholder}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      options={selectOptions}
      onValueChange={onChange}
      controlSize="lg"
    />
  );
}
