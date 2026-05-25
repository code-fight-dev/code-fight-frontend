import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { AuthFieldConfig } from "@/features/auth/model/types";
import { AuthField } from "@/features/auth/ui/AuthField";

function createFieldFixture(overrides: Partial<AuthFieldConfig> = {}): AuthFieldConfig {
  return {
    id: "password",
    label: "Password",
    placeholder: "Enter password",
    type: "password",
    icon: "password",
    autoComplete: "current-password",
    allowReveal: true,
    ...overrides,
  };
}

describe("features/auth/ui/AuthField", () => {
  it("renders field label, input attrs and auxiliary link", () => {
    const field = createFieldFixture({
      auxiliaryLink: {
        label: "Forgot password?",
        href: "/recovery",
      },
      maxLength: 64,
      required: true,
    });

    render(<AuthField field={field} />);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("name", "password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("placeholder", "Enter password");
    expect(input).toHaveAttribute("maxlength", "64");
    expect(input).toBeRequired();

    const link = screen.getByRole("link", { name: "Forgot password?" });
    expect(link).toHaveAttribute("href", "/recovery");
  });

  it("toggles password visibility when reveal button is clicked", async () => {
    const user = userEvent.setup();
    render(<AuthField field={createFieldFixture()} />);

    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(input).toHaveAttribute("type", "password");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("does not render reveal button for password field without allowReveal", () => {
    render(
      <AuthField
        field={createFieldFixture({
          allowReveal: false,
        })}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Show password" }),
    ).not.toBeInTheDocument();
  });

  it("does not render reveal button for non-password field", () => {
    render(
      <AuthField
        field={createFieldFixture({
          id: "email",
          label: "Email",
          type: "email",
          icon: "email",
          allowReveal: true,
        })}
      />,
    );

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(
      screen.queryByRole("button", { name: "Show password" }),
    ).not.toBeInTheDocument();
  });

  it("propagates disabled state to input and reveal button", () => {
    render(<AuthField field={createFieldFixture()} disabled />);

    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled();
  });
});
