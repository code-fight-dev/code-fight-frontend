import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "@/shared/ui/Select";

vi.mock("@/shared/ui/Select/useSelectListboxPosition", () => ({
  useSelectListboxPosition: () => ({
    top: 100,
    left: 120,
    width: 240,
  }),
}));

const languageOptions = [
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" },
  { value: "py", label: "Python" },
  { value: "rs", label: "Rust", disabled: true },
];

function renderSelect(props: Partial<React.ComponentProps<typeof Select<string>>> = {}) {
  const onValueChange = vi.fn();
  const onBlur = vi.fn();
  const onKeyDown = vi.fn();

  const renderResult = render(
    <Select
      aria-label="Programming language"
      name="language"
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onValueChange={onValueChange}
      options={languageOptions}
      placeholder="Choose language"
      value=""
      {...props}
    />,
  );

  const trigger = screen.getByRole("button", {
    name: "Programming language",
  });

  return {
    ...renderResult,
    onValueChange,
    onBlur,
    onKeyDown,
    trigger,
  };
}

describe("Select", () => {
  describe("rendering", () => {
    it("renders placeholder when no option is selected", () => {
      const { trigger } = renderSelect();

      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("type", "button");
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      expect(screen.getByText("Choose language")).toBeInTheDocument();
    });

    it("renders selected option label", () => {
      renderSelect({
        value: "ts",
      });

      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    it("renders hidden input when name is provided", () => {
      const { container } = renderSelect({
        value: "py",
        name: "selectedLanguage",
      });

      const hiddenInput = container.querySelector(
        'input[type="hidden"][name="selectedLanguage"]',
      );

      expect(hiddenInput).toHaveValue("py");
    });

    it("does not render hidden input when name is not provided", () => {
      const { container } = renderSelect({
        name: undefined,
      });

      expect(container.querySelector('input[type="hidden"]')).not.toBeInTheDocument();
    });

    it("merges custom className on root element", () => {
      const { container } = renderSelect({
        className: "custom-select-class",
      });

      const root = container.firstElementChild;

      expect(root).toHaveClass("relative");
      expect(root).toHaveClass("custom-select-class");
    });

    it("renders options without placeholder when placeholder is not provided", async () => {
      const user = userEvent.setup();

      const { trigger } = renderSelect({
        placeholder: undefined,
        value: "js",
      });

      expect(screen.getByText("JavaScript")).toBeInTheDocument();
      expect(screen.queryByText("Choose language")).not.toBeInTheDocument();

      await user.click(trigger);

      const listbox = screen.getByRole("listbox");

      expect(within(listbox).getByText("JavaScript")).toBeInTheDocument();
      expect(within(listbox).queryByText("Choose language")).not.toBeInTheDocument();
    });
  });

  describe("pointer interaction", () => {
    it("opens listbox on trigger click", async () => {
      const user = userEvent.setup();
      const { trigger } = renderSelect();

      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(trigger).toHaveAttribute("aria-controls");

      const listbox = screen.getByRole("listbox");

      expect(listbox).toBeInTheDocument();
      expect(within(listbox).getByText("JavaScript")).toBeInTheDocument();
      expect(within(listbox).getByText("TypeScript")).toBeInTheDocument();
      expect(within(listbox).getByText("Python")).toBeInTheDocument();
      expect(within(listbox).getByText("Rust")).toBeInTheDocument();
    });

    it("closes listbox when trigger is clicked again", async () => {
      const user = userEvent.setup();
      const { trigger } = renderSelect();

      await user.click(trigger);

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.click(trigger);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("selects enabled option by click", async () => {
      const user = userEvent.setup();
      const { onValueChange, trigger } = renderSelect();

      await user.click(trigger);

      const listbox = screen.getByRole("listbox");

      await user.click(within(listbox).getByText("Python"));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith("py");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("does not select disabled option by click", async () => {
      const user = userEvent.setup();
      const { onValueChange, trigger } = renderSelect();

      await user.click(trigger);

      const listbox = screen.getByRole("listbox");

      await user.click(within(listbox).getByText("Rust"));

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("closes listbox on outside pointer down", async () => {
      const user = userEvent.setup();
      const { trigger } = renderSelect();

      render(<button type="button">Outside button</button>);

      await user.click(trigger);

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.pointerDown(screen.getByRole("button", { name: "Outside button" }));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("keeps listbox open on inside pointer down", async () => {
      const user = userEvent.setup();
      const { trigger } = renderSelect();

      await user.click(trigger);

      const listbox = screen.getByRole("listbox");

      fireEvent.pointerDown(listbox);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  describe("keyboard interaction", () => {
    it("opens listbox with ArrowDown", () => {
      const { trigger } = renderSelect();

      fireEvent.keyDown(trigger, {
        key: "ArrowDown",
      });

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens listbox with ArrowUp", () => {
      const { trigger } = renderSelect();

      fireEvent.keyDown(trigger, {
        key: "ArrowUp",
      });

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens listbox with Enter", () => {
      const { trigger } = renderSelect();

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens listbox with Space", () => {
      const { trigger } = renderSelect();

      fireEvent.keyDown(trigger, {
        key: " ",
      });

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("selects active option with Enter when listbox is open", () => {
      const { onValueChange, trigger } = renderSelect();

      fireEvent.keyDown(trigger, {
        key: "ArrowDown",
      });

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(onValueChange).toHaveBeenCalledWith("js");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("selects active option with Space when listbox is open", () => {
      const { onValueChange, trigger } = renderSelect();

      fireEvent.keyDown(trigger, {
        key: "ArrowDown",
      });

      fireEvent.keyDown(trigger, {
        key: " ",
      });

      expect(onValueChange).toHaveBeenCalledWith("js");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("skips disabled option during keyboard navigation", () => {
      const { onValueChange, trigger } = renderSelect({
        value: "py",
      });

      fireEvent.keyDown(trigger, {
        key: "ArrowDown",
      });

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(onValueChange).toHaveBeenCalledWith("");
    });

    it("closes listbox on Escape key", async () => {
      const user = userEvent.setup();
      const { trigger } = renderSelect();

      await user.click(trigger);

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(document, {
        key: "Escape",
      });

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("uses first enabled option as preferred active option when selected value is unknown", () => {
      const { onValueChange, trigger } = renderSelect({
        placeholder: undefined,
        value: "unknown",
      });

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(onValueChange).toHaveBeenCalledWith("js");
    });

    it("does not select disabled selected option with Enter", () => {
      const { onValueChange, trigger } = renderSelect({
        value: "rs",
      });

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens empty listbox with ArrowDown when there are no options", () => {
      const { trigger } = renderSelect({
        options: [],
        placeholder: undefined,
      });

      fireEvent.keyDown(trigger, {
        key: "ArrowDown",
      });

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens empty listbox with ArrowUp when there are no options", () => {
      const { trigger } = renderSelect({
        options: [],
        placeholder: undefined,
      });

      fireEvent.keyDown(trigger, {
        key: "ArrowUp",
      });

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("ignores unsupported keyboard keys", () => {
      const { onValueChange, trigger } = renderSelect();

      fireEvent.keyDown(trigger, {
        key: "Tab",
      });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("keeps active index empty when all options are disabled", () => {
      const disabledOptions = [
        { value: "js", label: "JavaScript", disabled: true },
        { value: "ts", label: "TypeScript", disabled: true },
      ];

      const { onValueChange, trigger } = renderSelect({
        options: disabledOptions,
        placeholder: undefined,
        value: "unknown",
      });

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(trigger, {
        key: "Enter",
      });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  describe("disabled behavior", () => {
    it("does not open listbox when disabled", async () => {
      const user = userEvent.setup();
      const { trigger } = renderSelect({
        disabled: true,
      });

      expect(trigger).toBeDisabled();

      await user.click(trigger);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("does not handle keyboard interaction when disabled", () => {
      const { trigger } = renderSelect({
        disabled: true,
      });

      fireEvent.keyDown(trigger, {
        key: "ArrowDown",
      });

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("external handlers", () => {
    it("calls external onKeyDown handler", () => {
      const onKeyDown = vi.fn();
      const { trigger } = renderSelect({
        onKeyDown,
      });

      fireEvent.keyDown(trigger, {
        key: "ArrowDown",
      });

      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it("does not handle keyboard interaction when external onKeyDown prevents default", () => {
      const onKeyDown = vi.fn((event) => {
        event.preventDefault();
      });

      const { trigger } = renderSelect({
        onKeyDown,
      });

      fireEvent.keyDown(trigger, {
        key: "ArrowDown",
      });

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("calls external onBlur handler", () => {
      const onBlur = vi.fn();
      const { trigger } = renderSelect({
        onBlur,
      });

      fireEvent.blur(trigger);

      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
});
