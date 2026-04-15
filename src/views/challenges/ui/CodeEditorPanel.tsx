"use client";

import dynamic from "next/dynamic";
import { loader, useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useMemo, useState } from "react";
import { buildMonacoEditorOptions } from "@/features/preferences/model/editor";
import {
  defineCodeFightMonacoThemes,
  getCurrentAppTheme,
  resolveMonacoThemeName,
} from "@/features/preferences/model/editorMonaco";
import { usePreferences } from "@/features/preferences/ui/PreferencesProvider";

loader.config({ monaco });

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="challenge-code-block flex h-full min-h-100 items-center justify-center text-[13px] text-(--app-text-faint)">
      Loading editor
    </div>
  ),
});

type Props = {
  language: string;
  value: string;
  fileName: string;
  onChange: (value: string) => void;
};

export function CodeEditorPanel({ language, value, fileName, onChange }: Props) {
  const monacoInstance = useMonaco();
  const { preferences } = usePreferences();
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
    () => buildMonacoEditorOptions(preferences.editor),
    [preferences.editor],
  );

  return (
    <div className="challenge-code-block flex min-h-100 flex-1 flex-col overflow-hidden rounded-lg">
      <div className="flex h-10 items-center justify-between border-b border-(--app-surface-code-border) bg-(--app-surface-code-topbar) px-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-md bg-rose-300/80" />
          <span className="h-2.5 w-2.5 rounded-md bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-md bg-emerald-300/80" />
        </div>

        <span className="font-accent text-[12px] text-(--app-text-faint)">
          {fileName}
        </span>
      </div>

      <div className="min-h-0 flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          theme={editorTheme}
          value={value}
          beforeMount={defineCodeFightMonacoThemes}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          options={editorOptions}
        />
      </div>
    </div>
  );
}
