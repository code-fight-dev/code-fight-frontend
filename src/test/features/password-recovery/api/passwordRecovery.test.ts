import { afterEach, describe, expect, it, vi } from "vitest";

import {
  confirmPasswordReset,
  requestPasswordReset,
} from "@/features/password-recovery/api/passwordRecovery";

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("features/password-recovery/api/passwordRecovery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("submits password reset request payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ ok: true }, 200));
    vi.stubGlobal("fetch", fetchMock);

    await requestPasswordReset({
      email: "coder@example.com",
    });

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/auth/password-reset/request");
    expect(request).toMatchObject({
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(JSON.parse(String(request.body))).toEqual({
      email: "coder@example.com",
    });
  });

  it("submits password reset request with captcha token when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ ok: true }, 200));
    vi.stubGlobal("fetch", fetchMock);

    await requestPasswordReset({
      email: "coder@example.com",
      captchaToken: "recaptcha-token",
    });

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(request.body))).toEqual({
      email: "coder@example.com",
      captchaToken: "recaptcha-token",
    });
  });

  it("submits password reset confirmation payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ ok: true }, 200));
    vi.stubGlobal("fetch", fetchMock);

    await confirmPasswordReset({
      email: "coder@example.com",
      code: "123456",
      password: "Secret123",
    });

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/auth/password-reset/confirm");
    expect(JSON.parse(String(request.body))).toEqual({
      email: "coder@example.com",
      code: "123456",
      password: "Secret123",
    });
  });

  it("throws backend error message for failed request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          error: "invalid input: valid email is required",
        },
        400,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestPasswordReset({
        email: "broken",
      }),
    ).rejects.toThrow("invalid input: valid email is required");
  });

  it("uses fallback error message when response body is malformed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("not-json", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      confirmPasswordReset({
        email: "coder@example.com",
        code: "123456",
        password: "Secret123",
      }),
    ).rejects.toThrow("Could not reset password");
  });
});
