import { loader } from "@monaco-editor/react";

let monacoConfigurePromise: Promise<void> | null = null;

export function ensureReplayMonacoConfigured(): Promise<void> {
  if (monacoConfigurePromise) {
    return monacoConfigurePromise;
  }

  monacoConfigurePromise = import("monaco-editor")
    .then((monacoModule) => {
      loader.config({ monaco: monacoModule });
    })
    .catch((error: unknown) => {
      monacoConfigurePromise = null;
      throw error;
    });

  return monacoConfigurePromise;
}
