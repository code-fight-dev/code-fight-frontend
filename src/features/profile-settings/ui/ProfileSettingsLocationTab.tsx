import { MapPin } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { ProfileSettingsSaveButton } from "./ProfileSettingsSaveButton";

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
    <section className="app-settings-section overflow-hidden rounded-[30px] p-5 sm:p-6">
      <div className="app-settings-kicker flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase">
        <MapPin className="h-4.5 w-4.5" strokeWidth={1.95} />
        Location
      </div>

      <h3 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
        Update your location
      </h3>
      <p className="mt-2 text-[15px] leading-[1.7] tracking-[-0.03em] text-(--app-text-muted)">
        Update your location if you want. Countries, states or provinces, and cities are
        filtered progressively from the selected geography.
      </p>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
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

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-400/18 bg-red-500/8 px-4 py-3 text-[14px] tracking-[-0.02em] text-red-400">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end gap-3 border-t border-(--app-settings-divider) pt-5">
        <Button
          variant="secondary"
          onClick={onReset}
          disabled={isSaving || !hasChanges}
          className="min-h-10 rounded-xl px-4 text-[13px]"
        >
          Cancel
        </Button>
        <ProfileSettingsSaveButton
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          isPending={isSavePending}
        />
      </div>
    </section>
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
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
