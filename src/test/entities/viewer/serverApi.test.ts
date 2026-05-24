import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Viewer } from "@/entities/viewer";

const serverMocks = vi.hoisted(() => ({
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: serverMocks.headers,
}));

function createViewer(username = "alice"): Viewer {
  return {
    id: `viewer-${username}`,
    email: `${username}@example.com`,
    username,
    createdAt: "2026-05-24T12:00:00.000Z",
  };
}

async function importServerApi() {
  vi.resetModules();
  return import("@/entities/viewer/server");
}

describe("viewer server api", () => {
  beforeEach(() => {
    serverMocks.headers.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns null when request has no cookie header", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    serverMocks.headers.mockResolvedValue(new Headers());

    const { getCurrentViewerServer } = await importServerApi();
    const viewer = await getCurrentViewerServer();

    expect(viewer).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns viewer when backend returns valid auth response", async () => {
    const viewer = createViewer();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: viewer }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    serverMocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));

    const { getCurrentViewerServer } = await importServerApi();
    const result = await getCurrentViewerServer();

    expect(result).toEqual(viewer);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/me"), {
      method: "GET",
      headers: {
        cookie: "session=token",
      },
      cache: "no-store",
    });
  });

  it("returns null when backend responds with 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);
    serverMocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));

    const { getCurrentViewerServer } = await importServerApi();
    await expect(getCurrentViewerServer()).resolves.toBeNull();
  });

  it("returns null when backend responds with non-OK status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    serverMocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));

    const { getCurrentViewerServer } = await importServerApi();
    await expect(getCurrentViewerServer()).resolves.toBeNull();
  });

  it("returns null when auth response shape is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "broken" } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    serverMocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));

    const { getCurrentViewerServer } = await importServerApi();
    await expect(getCurrentViewerServer()).resolves.toBeNull();
  });

  it("returns null when auth response JSON is malformed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("not-json", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    serverMocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));

    const { getCurrentViewerServer } = await importServerApi();
    await expect(getCurrentViewerServer()).resolves.toBeNull();
  });

  it("returns null when backend request throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network down"));
    vi.stubGlobal("fetch", fetchMock);
    serverMocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));

    const { getCurrentViewerServer } = await importServerApi();
    await expect(getCurrentViewerServer()).resolves.toBeNull();
  });
});
