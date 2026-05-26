import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProfileSettingsLocationTab } from "@/features/profile-settings/ui/ProfileSettingsLocationTab";

vi.mock("@/shared/ui/Select", () => ({
  Select: ({
    value,
    disabled,
    placeholder,
    options,
    onValueChange,
    ...rest
  }: {
    value: string;
    disabled?: boolean;
    placeholder?: string;
    options: Array<{ value: string; label: string }>;
    onValueChange: (value: string) => void;
    [key: string]: unknown;
  }) => (
    <select
      {...rest}
      value={value}
      disabled={disabled}
      data-placeholder={placeholder}
      onChange={(event) => onValueChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

function renderLocationTab(
  overrides: Partial<ComponentProps<typeof ProfileSettingsLocationTab>> = {},
) {
  const props: ComponentProps<typeof ProfileSettingsLocationTab> = {
    country: "",
    stateProvince: "",
    city: "",
    countryOptions: ["United States", "Canada"],
    stateProvinceOptions: [],
    cityOptions: [],
    isSaving: false,
    isSavePending: false,
    hasChanges: false,
    errorMessage: null,
    onCountryChange: vi.fn(),
    onStateProvinceChange: vi.fn(),
    onCityChange: vi.fn(),
    onReset: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };

  const result = render(<ProfileSettingsLocationTab {...props} />);
  return { ...result, props };
}

describe("features/profile-settings/ui/ProfileSettingsLocationTab", () => {
  it("disables dependent selects when country is not selected", () => {
    renderLocationTab();

    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(3);
    expect(selects[0]).not.toBeDisabled();
    expect(selects[1]).toBeDisabled();
    expect(selects[2]).toBeDisabled();
    expect(selects[1]).toHaveAttribute("data-placeholder", "Choose country first");
    expect(selects[2]).toHaveAttribute("data-placeholder", "Choose country first");
  });

  it("requires state selection before city when state options exist", () => {
    renderLocationTab({
      country: "United States",
      stateProvinceOptions: ["California", "New York"],
      stateProvince: "",
      cityOptions: ["San Francisco"],
    });

    const selects = screen.getAllByRole("combobox");
    expect(selects[1]).not.toBeDisabled();
    expect(selects[2]).toBeDisabled();
    expect(selects[2]).toHaveAttribute("data-placeholder", "Choose state/province first");
  });

  it("shows fallback placeholders when no state or city data exists", () => {
    renderLocationTab({
      country: "United States",
      stateProvince: "",
      stateProvinceOptions: [],
      cityOptions: [],
    });

    const selects = screen.getAllByRole("combobox");
    expect(selects[1]).toBeDisabled();
    expect(selects[1]).toHaveAttribute("data-placeholder", "No state/province data");
    expect(selects[2]).toBeDisabled();
    expect(selects[2]).toHaveAttribute("data-placeholder", "No cities found");
  });

  it("enables city select when enough location data is selected", async () => {
    const user = userEvent.setup();
    const onCountryChange = vi.fn();
    const onStateProvinceChange = vi.fn();
    const onCityChange = vi.fn();
    const onReset = vi.fn();
    const onSave = vi.fn();

    renderLocationTab({
      country: "United States",
      stateProvince: "California",
      city: "San Francisco",
      stateProvinceOptions: ["California"],
      cityOptions: ["San Francisco", "San Diego"],
      hasChanges: true,
      errorMessage: "Location is invalid",
      onCountryChange,
      onStateProvinceChange,
      onCityChange,
      onReset,
      onSave,
    });

    const selects = screen.getAllByRole("combobox");
    expect(selects[2]).not.toBeDisabled();
    expect(selects[2]).toHaveAttribute("data-placeholder", "City/Town");

    await user.selectOptions(selects[0], "Canada");
    await user.selectOptions(selects[1], "California");
    await user.selectOptions(selects[2], "San Diego");

    expect(onCountryChange).toHaveBeenCalledWith("Canada");
    expect(onStateProvinceChange).toHaveBeenCalledWith("California");
    expect(onCityChange).toHaveBeenCalledWith("San Diego");

    expect(
      screen.getByText(
        "Some countries expose city selection only after a state or province is chosen.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Location is invalid")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
