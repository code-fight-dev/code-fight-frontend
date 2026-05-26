import { describe, expect, it } from "vitest";

import { getOAuthErrorCode } from "@/views/auth/model/getOAuthErrorCode";

describe("views/auth/model/getOAuthErrorCode", () => {
  it("returns same string error code", () => {
    expect(getOAuthErrorCode("OAuthAccountNotLinked")).toBe("OAuthAccountNotLinked");
  });

  it("returns first entry for string arrays", () => {
    expect(getOAuthErrorCode(["AccessDenied", "Ignored"])).toBe("AccessDenied");
    expect(getOAuthErrorCode([])).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(getOAuthErrorCode(undefined)).toBeNull();
  });
});
