import { afterEach, describe, expect, it, vi } from "vitest";

import { getCurrentViewer, signOutViewer } from "@/entities/viewer";
import { createViewerWithUsername } from "@/test/fixtures/viewer";

describe("viewer session api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns current viewer and forwards abort signal", async () => {
    const viewer = createViewerWithUsername();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: viewer }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const signal = new AbortController().signal;
    const result = await getCurrentViewer(signal);

    expect(result).toEqual(viewer);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/me"), {
      method: "GET",
      credentials: "include",
      signal,
    });
  });

  it("returns null when current viewer endpoint responds with 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentViewer()).resolves.toBeNull();
  });

  it("throws when current viewer request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentViewer()).rejects.toThrow("Failed to fetch current user");
  });

  it("throws when current viewer response shape is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "broken" } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentViewer()).rejects.toThrow("Invalid current user response");
  });

  it("throws when current viewer response JSON is malformed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("not-json", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentViewer()).rejects.toThrow("Invalid current user response");
  });

  it("signs out viewer with credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(signOutViewer()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/sign-out"), {
      method: "POST",
      credentials: "include",
    });
  });

  it("throws when sign out request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(signOutViewer()).rejects.toThrow("Failed to sign out");
  });
});
