"use client";

import { useEffect, useMemo, useState } from "react";
import { buildMonacoEditorOptions } from "@/features/preferences/model/editor";
import {
  getCurrentAppTheme,
  resolveMonacoThemeName,
} from "@/features/preferences/model/editorMonaco";
import { usePreferences } from "@/features/preferences/ui/PreferencesProvider";
import { ConfiguredMonacoEditor } from "./code-editor/ConfiguredMonacoEditor";
import { MonacoLoadingView } from "./code-editor/MonacoLoadingView";
import { ensureMonacoConfigured } from "./code-editor/ensureMonacoConfigured";

type Props = {
  language: string;
  value: string;
  fileName: string;
  onChange: (value: string) => void;
};

export function ArenaCodeEditorPanel({ language, value, fileName, onChange }: Props) {
  const { preferences } = usePreferences();
  const [isMonacoConfigured, setIsMonacoConfigured] = useState(false);
  const [appTheme, setAppTheme] = useState<"dark" | "light">(() => getCurrentAppTheme());

  useEffect(() => {
    let cancelled = false;

    void ensureMonacoConfigured()
      .then(() => {
        if (!cancelled) {
          setIsMonacoConfigured(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsMonacoConfigured(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const editorOptions = useMemo(
    () => buildMonacoEditorOptions(preferences.editor),
    [preferences.editor],
  );

  return (
    <div className="challenge-code-block flex min-h-102 flex-1 flex-col overflow-hidden rounded-xl">
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
        {isMonacoConfigured ? (
          <ConfiguredMonacoEditor
            language={language}
            value={value}
            editorTheme={editorTheme}
            editorOptions={editorOptions}
            onChange={onChange}
          />
        ) : (
          <MonacoLoadingView />
        )}
      </div>
    </div>
  );
}
