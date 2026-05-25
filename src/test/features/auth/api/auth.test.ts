import { afterEach, describe, expect, it, vi } from "vitest";

import { getOAuthStartUrl, submitAuth } from "@/features/auth/api/auth";
import { createViewerWithUsername } from "@/test/fixtures/viewer";

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("features/auth/api/auth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("builds oauth start url with provider and mode", () => {
    const url = new URL(getOAuthStartUrl("github", "signin"));

    expect(url.pathname).toBe("/auth/oauth/github/start");
    expect(url.searchParams.get("mode")).toBe("signin");
  });

  it("submits sign in payload and returns authenticated viewer", async () => {
    const viewer = createViewerWithUsername("alice", {
      id: "viewer-1",
      createdAt: "2026-05-25T10:00:00.000Z",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ user: viewer }, 200));
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitAuth("signin", {
      email: "alice@example.com",
      password: "secret",
    });

    expect(result).toEqual(viewer);

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/auth/sign-in");
    expect(request).toMatchObject({
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(JSON.parse(String(request.body))).toEqual({
      email: "alice@example.com",
      password: "secret",
    });
  });

  it("submits sign up payload to sign-up endpoint", async () => {
    const viewer = createViewerWithUsername("alice", {
      id: "viewer-1",
      createdAt: "2026-05-25T10:00:00.000Z",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ user: viewer }, 200));
    vi.stubGlobal("fetch", fetchMock);

    await submitAuth("signup", {
      username: "alice",
      email: "alice@example.com",
      password: "secret",
    });

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/auth/sign-up");
    expect(JSON.parse(String(request.body))).toEqual({
      username: "alice",
      email: "alice@example.com",
      password: "secret",
    });
  });

  it("uses backend error message for failed auth response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          error: "invalid credentials",
        },
        401,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitAuth("signin", {
        email: "alice@example.com",
        password: "wrong",
      }),
    ).rejects.toThrow("invalid credentials");
  });

  it("falls back to default auth error when error payload is missing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("not-json", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitAuth("signin", {
        email: "alice@example.com",
        password: "wrong",
      }),
    ).rejects.toThrow("Authentication failed");
  });

  it("throws when successful auth response does not contain a valid viewer", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          user: {
            id: "broken",
          },
        },
        200,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitAuth("signin", {
        email: "alice@example.com",
        password: "secret",
      }),
    ).rejects.toThrow("Invalid authentication response");
  });

  it("throws when successful auth response has malformed json", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("broken-json", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitAuth("signin", {
        email: "alice@example.com",
        password: "secret",
      }),
    ).rejects.toThrow("Invalid authentication response");
  });
});
