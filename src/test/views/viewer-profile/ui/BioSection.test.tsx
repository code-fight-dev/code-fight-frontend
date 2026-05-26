import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BioSection } from "@/views/viewer-profile/ui/BioSection";

describe("views/viewer-profile/ui/BioSection", () => {
  it("renders editable bio field with counter and change handler", () => {
    const onChange = vi.fn();

    render(<BioSection value="Hello" isEditable isSaving={false} onChange={onChange} />);

    const input = screen.getByPlaceholderText(
      "Tell other coders what you enjoy building and competing with.",
    );

    expect(input).toHaveValue("Hello");
    expect(screen.getByText("5/255")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Updated bio" } });

    expect(onChange).toHaveBeenCalledWith("Updated bio");
  });

  it("disables textarea while bio is saving", () => {
    render(<BioSection value="Saving..." isEditable isSaving onChange={vi.fn()} />);

    expect(
      screen.getByPlaceholderText(
        "Tell other coders what you enjoy building and competing with.",
      ),
    ).toBeDisabled();
  });

  it("renders static fallback text for non-editable empty bio", () => {
    render(
      <BioSection value="" isEditable={false} isSaving={false} onChange={vi.fn()} />,
    );

    expect(screen.getByText("No bio added yet.")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
