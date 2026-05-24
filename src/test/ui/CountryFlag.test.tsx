import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountryFlag } from "@/shared/ui/CountryFlag";

describe("CountryFlag", () => {
  it("renders flag by country code", () => {
    const { container } = render(<CountryFlag countryCode="DE" />);

    const flagWrapper = screen.getByTitle("DE");

    expect(flagWrapper).toBeInTheDocument();
    expect(flagWrapper).toHaveAttribute("aria-hidden", "true");
    expect(flagWrapper).toHaveClass("inline-flex");
    expect(flagWrapper).toHaveClass("shrink-0");
    expect(flagWrapper).toHaveClass("overflow-hidden");
    expect(flagWrapper).toHaveClass("rounded-lg");

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("normalizes country code before resolving flag", () => {
    const { container } = render(<CountryFlag countryCode=" de " />);

    expect(screen.getByTitle("DE")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("falls back to country name when country code is invalid", () => {
    const { container } = render(
      <CountryFlag countryCode="invalid" countryName="Germany" />,
    );

    expect(screen.getByTitle("Germany")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses country name as title when it is provided", () => {
    render(<CountryFlag countryCode="UA" countryName="Ukraine" />);

    expect(screen.getByTitle("Ukraine")).toBeInTheDocument();
  });

  it("uses normalized country code as title when country name is not provided", () => {
    render(<CountryFlag countryCode="ua" />);

    expect(screen.getByTitle("UA")).toBeInTheDocument();
  });

  it("merges custom className with base classes", () => {
    render(<CountryFlag countryCode="US" className="custom-country-flag-class" />);

    const flagWrapper = screen.getByTitle("US");

    expect(flagWrapper).toHaveClass("custom-country-flag-class");
    expect(flagWrapper).toHaveClass("inline-flex");
    expect(flagWrapper).toHaveClass("rounded-lg");
  });

  it("returns null when country code and country name cannot be resolved", () => {
    const { container } = render(
      <CountryFlag countryCode="invalid" countryName="Unknown Country" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("returns null when both country code and country name are empty", () => {
    const { container } = render(<CountryFlag countryCode="" countryName="" />);

    expect(container).toBeEmptyDOMElement();
  });
});
