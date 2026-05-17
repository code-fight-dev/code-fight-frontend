import { loader } from "@monaco-editor/react";

let monacoConfigurePromise: Promise<void> | null = null;

export function ensureMonacoConfigured(): Promise<void> {
  if (monacoConfigurePromise) {
    return monacoConfigurePromise;
  }

  monacoConfigurePromise = import("monaco-editor")
    .then((monacoModule) => {
      loader.config({ monaco: monacoModule });
    })
    .catch((error: unknown) => {
      // Allow retry on the next mount when dynamic Monaco loading fails once.
      monacoConfigurePromise = null;
      throw error;
    });

  return monacoConfigurePromise;
}
