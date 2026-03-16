export type Viewer = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
};

export type ViewerProfile = {
  id: string;
  username: string;
  createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function isViewer(value: unknown): value is Viewer {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.username === "string" &&
    typeof value.createdAt === "string"
  );
}

export function isViewerProfile(value: unknown): value is ViewerProfile {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.username === "string" &&
    typeof value.createdAt === "string"
  );
}
