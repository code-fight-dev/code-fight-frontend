import { afterEach, describe, expect, it, vi } from "vitest";
import { ManagementError, managementRequest } from "@/shared/api/management";

function mockResponse(body: unknown, status = 409, requestId?: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: {
          "Content-Type": "application/json",
          ...(requestId ? { "X-Request-ID": requestId } : {}),
        },
      }),
    ),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("management error metadata", () => {
  it("preserves typed code and request ID from a structured error", async () => {
    mockResponse(
      {
        error: {
          message: "Slug already taken",
          code: "slug_taken",
          requestId: "body-request",
        },
      },
      409,
      "header-request",
    );
    const request = managementRequest("/organizer/tournaments/draft-id");
    await expect(request).rejects.toBeInstanceOf(ManagementError);
    await expect(request).rejects.toMatchObject({
      status: 409,
      message: "Slug already taken",
      code: "slug_taken",
      requestId: "body-request",
    });
  });

  it("keeps legacy string errors without inferring a code from HTTP status", async () => {
    mockResponse({ error: "Legacy conflict" });
    await expect(
      managementRequest("/organizer/tournaments/draft-id"),
    ).rejects.toMatchObject({
      status: 409,
      message: "Legacy conflict",
      code: undefined,
      requestId: undefined,
    });
  });

  it("uses the request ID header when the error omits it", async () => {
    mockResponse(
      { error: { message: "Forbidden", code: "forbidden" } },
      403,
      "header-request",
    );
    await expect(managementRequest("/admin/users/user-id")).rejects.toMatchObject({
      status: 403,
      code: "forbidden",
      requestId: "header-request",
    });
  });

  it("preserves metadata even when the message is absent", async () => {
    mockResponse({ error: { code: "version_conflict", requestId: "version-request" } });
    await expect(
      managementRequest("/organizer/tournaments/draft-id"),
    ).rejects.toMatchObject({
      message: "The request could not be completed. Please try again.",
      code: "version_conflict",
      requestId: "version-request",
    });
  });

  it.each([
    null,
    { error: null },
    { error: [] },
    { error: { message: 42, code: {}, requestId: 123 } },
  ])("ignores malformed error fields: %j", async (body) => {
    mockResponse(body, 500, "header-request");
    await expect(managementRequest("/organizer/tournaments")).rejects.toMatchObject({
      status: 500,
      message: "The request could not be completed. Please try again.",
      code: undefined,
      requestId: "header-request",
    });
  });

  it("retains safe metadata for a non-JSON error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>Unavailable</html>", {
          status: 503,
          headers: { "X-Request-ID": "proxy-request" },
        }),
      ),
    );
    await expect(managementRequest("/organizer/tournaments")).rejects.toMatchObject({
      status: 503,
      message: "The request could not be completed. Please try again.",
      code: undefined,
      requestId: "proxy-request",
    });
  });

  it("leaves successful payloads unchanged", async () => {
    const body = { items: [], nextCursor: "next" };
    mockResponse(body, 200);
    await expect(managementRequest("/organizer/tournaments")).resolves.toEqual(body);
  });
});
