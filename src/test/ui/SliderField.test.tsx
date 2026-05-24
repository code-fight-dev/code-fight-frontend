import { fireEvent, render, screen } from "@testing-library/react";
import { useState, type ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { SliderField } from "@/shared/ui/SliderField";

function renderSliderField(props: Partial<ComponentProps<typeof SliderField>> = {}) {
  const onValueChange = vi.fn();

  const {
    className,
    description = "Controls editor font size.",
    inputLabel,
    label = "Font size",
    max = 30,
    min = 10,
    step,
    value = 20,
  } = props;

  function ControlledSliderField() {
    const [currentValue, setCurrentValue] = useState(value);

    return (
      <SliderField
        className={className}
        description={description}
        inputLabel={inputLabel}
        label={label}
        max={max}
        min={min}
        step={step}
        value={currentValue}
        onValueChange={(nextValue) => {
          setCurrentValue(nextValue);
          onValueChange(nextValue);
        }}
      />
    );
  }

  const renderResult = render(<ControlledSliderField />);
  const numberInputLabel = inputLabel ?? `${label} value`;

  return {
    ...renderResult,
    onValueChange,
    rangeInput: screen.getByLabelText(label) as HTMLInputElement,
    numberInput: screen.getByLabelText(numberInputLabel) as HTMLInputElement,
  };
}

describe("SliderField", () => {
  it("renders label, description, range input and number input", () => {
    const { rangeInput, numberInput } = renderSliderField();

    expect(screen.getByText("Font size")).toBeInTheDocument();
    expect(screen.getByText("Controls editor font size.")).toBeInTheDocument();

    expect(rangeInput).toHaveAttribute("type", "range");
    expect(rangeInput).toHaveAttribute("min", "10");
    expect(rangeInput).toHaveAttribute("max", "30");
    expect(rangeInput).toHaveAttribute("step", "1");
    expect(rangeInput).toHaveValue("20");

    expect(numberInput).toHaveAttribute("type", "number");
    expect(numberInput).toHaveAttribute("min", "10");
    expect(numberInput).toHaveAttribute("max", "30");
    expect(numberInput).toHaveAttribute("step", "1");
    expect(numberInput).toHaveValue(20);
  });

  it("uses custom input label for number input", () => {
    const { numberInput } = renderSliderField({
      inputLabel: "Editor font size value",
    });

    expect(numberInput).toBeInTheDocument();
    expect(numberInput).toHaveAttribute("type", "number");
  });

  it("merges custom className with base classes", () => {
    const { container } = renderSliderField({
      className: "custom-slider-field-class",
    });

    const wrapper = container.firstElementChild;

    expect(wrapper).toHaveClass("app-settings-section");
    expect(wrapper).toHaveClass("rounded-2xl");
    expect(wrapper).toHaveClass("p-4");
    expect(wrapper).toHaveClass("custom-slider-field-class");
  });

  it("sets range progress style based on current value", () => {
    const { rangeInput } = renderSliderField({
      min: 10,
      max: 30,
      value: 20,
    });

    expect(rangeInput.style.getPropertyValue("--app-slider-progress")).toBe("50%");
  });

  it("calls onValueChange when range input changes", () => {
    const { onValueChange, rangeInput } = renderSliderField();

    fireEvent.change(rangeInput, {
      target: {
        value: "24",
      },
    });

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(24);
    expect(rangeInput).toHaveValue("24");
  });

  it("shows current value in number input when not editing", () => {
    const { numberInput } = renderSliderField({
      value: 18,
    });

    expect(numberInput).toHaveValue(18);
  });

  it("commits number input value on blur", () => {
    const { onValueChange, numberInput } = renderSliderField();

    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, {
      target: {
        value: "25",
      },
    });
    fireEvent.blur(numberInput);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(25);
    expect(numberInput).toHaveValue(25);
  });

  it("clamps number input value to min on blur", () => {
    const { onValueChange, numberInput } = renderSliderField();

    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, {
      target: {
        value: "5",
      },
    });
    fireEvent.blur(numberInput);

    expect(onValueChange).toHaveBeenCalledWith(10);
    expect(numberInput).toHaveValue(10);
  });

  it("clamps number input value to max on blur", () => {
    const { onValueChange, numberInput } = renderSliderField();

    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, {
      target: {
        value: "40",
      },
    });
    fireEvent.blur(numberInput);

    expect(onValueChange).toHaveBeenCalledWith(30);
    expect(numberInput).toHaveValue(30);
  });

  it("aligns number input value to step on blur", () => {
    const { onValueChange, numberInput } = renderSliderField({
      step: 0.5,
    });

    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, {
      target: {
        value: "22.26",
      },
    });
    fireEvent.blur(numberInput);

    expect(onValueChange).toHaveBeenCalledWith(22.5);
    expect(numberInput).toHaveValue(22.5);
  });

  it("clears number input and clamps it to min on blur", () => {
    const { onValueChange, numberInput } = renderSliderField({
      value: 20,
    });

    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, {
      target: {
        value: "",
      },
    });
    fireEvent.blur(numberInput);

    expect(onValueChange).toHaveBeenCalledWith(10);
    expect(numberInput).toHaveValue(10);
  });

  it("commits number input value when Enter is pressed and input blurs", () => {
    const { onValueChange, numberInput } = renderSliderField();

    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, {
      target: {
        value: "26",
      },
    });
    fireEvent.keyDown(numberInput, {
      key: "Enter",
    });
    fireEvent.blur(numberInput);

    expect(onValueChange).toHaveBeenCalledWith(26);
    expect(numberInput).toHaveValue(26);
  });

  it("cancels editing when Escape is pressed and input blurs", () => {
    const { onValueChange, numberInput } = renderSliderField({
      value: 20,
    });

    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, {
      target: {
        value: "26",
      },
    });
    fireEvent.keyDown(numberInput, {
      key: "Escape",
    });
    fireEvent.blur(numberInput);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(numberInput).toHaveValue(20);
  });
});
