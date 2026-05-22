"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildMonacoEditorOptions,
  getCurrentAppTheme,
  resolveMonacoThemeName,
  usePreferences,
} from "@/features/preferences";
import { ReplayMonacoEditor } from "./code-editor/ReplayMonacoEditor";
import { ReplayMonacoLoadingView } from "./code-editor/ReplayMonacoLoadingView";
import { ensureReplayMonacoConfigured } from "./code-editor/ensureReplayMonacoConfigured";

type Props = {
  canViewSourceCode: boolean;
  language: string;
  code: string;
  title: string;
  verdict?: string;
  status?: string;
};

export function ArenaReplayCodePanel({
  canViewSourceCode,
  language,
  code,
  title,
  verdict,
  status,
}: Props) {
  const { preferences } = usePreferences();
  const [isMonacoConfigured, setIsMonacoConfigured] = useState(false);
  const [appTheme, setAppTheme] = useState<"dark" | "light">(() => getCurrentAppTheme());

  useEffect(() => {
    if (!canViewSourceCode) {
      return;
    }

    let cancelled = false;

    void ensureReplayMonacoConfigured()
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
  }, [canViewSourceCode]);

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
    () => ({
      ...buildMonacoEditorOptions(preferences.editor),
      readOnly: true,
      domReadOnly: true,
      minimap: { enabled: false },
    }),
    [preferences.editor],
  );

  return (
    <section className="challenge-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(14,22,42,0.95),rgba(9,14,29,0.92))]">
      <div className="challenge-panel-header flex items-center justify-between gap-3 border-b border-(--app-option-border) p-3 sm:p-4">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.16em] text-(--app-text-faint) uppercase">
            Replay Editor
          </p>
          <h3 className="mt-1 truncate text-[14px] font-semibold text-(--app-text-strong)">
            {title}
          </h3>
        </div>
        <div className="text-right text-[12px] text-(--app-text-soft)">
          <p>{canViewSourceCode ? language : "Source hidden"}</p>
          <p className="mt-0.5 text-(--app-text-faint)">
            {verdict ? verdict.replaceAll("_", " ") : (status ?? "snapshot")}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {!canViewSourceCode ? (
          <div className="challenge-code-block flex h-full min-h-100 items-center justify-center px-6 text-center text-[13px] text-(--app-text-faint)">
            Source code is hidden for this replay.
          </div>
        ) : isMonacoConfigured ? (
          <ReplayMonacoEditor
            language={language}
            value={code}
            editorTheme={editorTheme}
            editorOptions={editorOptions}
          />
        ) : (
          <ReplayMonacoLoadingView />
        )}
      </div>
    </section>
  );
}
