import { vi } from "vitest";

type MockWithCalls = {
  mock: {
    calls: unknown[][];
  };
};

export async function loadPageModule<T>(
  importer: () => Promise<T>,
  setupMocks?: () => void,
): Promise<T> {
  vi.resetModules();
  vi.clearAllMocks();
  setupMocks?.();
  return importer();
}

export function getFirstCallProps<T>(mockFn: MockWithCalls): T | undefined {
  return mockFn.mock.calls[0]?.[0] as T | undefined;
}
