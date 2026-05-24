import { describe, expect, it } from "vitest";

import { cn } from "@/shared/lib/cn";

describe("cn", () => {
  it("joins truthy class names with spaces", () => {
    expect(cn("btn", "btn-primary", "active")).toBe("btn btn-primary active");
  });

  it("filters falsy values", () => {
    expect(cn("btn", undefined, false, null, "active")).toBe("btn active");
  });

  it("returns an empty string when all values are falsy", () => {
    expect(cn(undefined, false, null)).toBe("");
  });
});
