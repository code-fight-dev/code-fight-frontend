import { MapPin } from "lucide-react";
import { ProfileSettingsErrorNotice } from "@/features/profile-settings/ui/ProfileSettingsErrorNotice";
import { ProfileSettingsFormActions } from "@/features/profile-settings/ui/ProfileSettingsFormActions";
import { ProfileSettingsSectionCard } from "@/features/profile-settings/ui/ProfileSettingsSectionCard";

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
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="app-input-surface h-14.5 w-full rounded-2xl px-4 text-[15px] tracking-[-0.03em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_12px_30px_rgba(3,7,18,0.12)] disabled:cursor-not-allowed disabled:opacity-55"
    >
      <option value="" style={{ color: "black", backgroundColor: "white" }}>
        {placeholder}
      </option>

      {options.map((option) => (
        <option
          key={option}
          value={option}
          style={{ color: "black", backgroundColor: "white" }}
        >
          {option}
        </option>
      ))}
    </select>
  );
}
