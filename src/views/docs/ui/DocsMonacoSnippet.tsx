"use client";

import { loader, useMonaco } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import * as monaco from "monaco-editor";
import { useEffect, useMemo, useState } from "react";
import {
  buildMonacoEditorOptions,
  defineCodeFightMonacoThemes,
  getCurrentAppTheme,
  resolveMonacoThemeName,
  usePreferences,
} from "@/features/preferences";

loader.config({ monaco });

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="challenge-code-block flex h-full min-h-56 items-center justify-center text-[13px] text-(--app-text-faint)">
      Loading snippet...
    </div>
  ),
});

type Props = {
  fileName?: string;
  language?: string;
  value: string;
};

export function DocsMonacoSnippet({
  fileName = "request.ts",
  language = "typescript",
  value,
}: Props) {
  const { preferences } = usePreferences();
  const monacoInstance = useMonaco();
  const [appTheme, setAppTheme] = useState<"dark" | "light">(() => getCurrentAppTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const nextTheme = getCurrentAppTheme();
      setAppTheme((currentTheme) =>
        currentTheme === nextTheme ? currentTheme : nextTheme,
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const editorTheme = useMemo(
    () => resolveMonacoThemeName(appTheme, preferences.editor.useAppTheme),
    [appTheme, preferences.editor.useAppTheme],
  );

  useEffect(() => {
    if (!monacoInstance) {
      return;
    }

    monacoInstance.editor.setTheme(editorTheme);
  }, [editorTheme, monacoInstance]);

  const editorOptions = useMemo(
    () => ({
      ...buildMonacoEditorOptions(preferences.editor),
      contextmenu: false,
      domReadOnly: true,
      folding: false,
      lineNumbersMinChars: 3,
      minimap: { enabled: false },
      readOnly: true,
      scrollBeyondLastLine: false,
      wordWrap: "on" as const,
      padding: {
        top: 14,
        bottom: 14,
      },
    }),
    [preferences.editor],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-(--app-surface-code-border) bg-(--app-surface-code)">
      <div className="flex h-10 items-center justify-between border-b border-(--app-surface-code-border) bg-(--app-surface-code-topbar) px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
        </div>

        <span className="font-accent text-[12px] text-(--app-text-faint)">
          {fileName}
        </span>
      </div>

      <div className="h-64 sm:h-72">
        <MonacoEditor
          height="100%"
          language={language}
          theme={editorTheme}
          value={value}
          beforeMount={defineCodeFightMonacoThemes}
          options={editorOptions}
        />
      </div>
    </div>
  );
}
