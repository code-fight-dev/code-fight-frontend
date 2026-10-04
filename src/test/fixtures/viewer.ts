import type { Viewer } from "@/entities/viewer";

const DEFAULT_VIEWER_CREATED_AT = "2026-05-24T12:00:00.000Z";

export function createViewerFixture(
  id = "viewer-1",
  overrides: Partial<Viewer> = {},
): Viewer {
  return {
    id: overrides.id ?? id,
    role: overrides.role ?? "user",
    roleVersion: overrides.roleVersion ?? 1,
    email: overrides.email ?? `${id}@example.com`,
    username: overrides.username ?? id,
    createdAt: overrides.createdAt ?? DEFAULT_VIEWER_CREATED_AT,
  };
}

export function createViewerWithUsername(
  username = "alice",
  overrides: Partial<Viewer> = {},
): Viewer {
  return createViewerFixture(`viewer-${username}`, {
    username,
    email: `${username}@example.com`,
    ...overrides,
  });
}
