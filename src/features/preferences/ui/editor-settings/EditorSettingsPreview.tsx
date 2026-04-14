"use client";

import { loader, useMonaco } from "@monaco-editor/react";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import * as monaco from "monaco-editor";
import { useEffect, useMemo, useState } from "react";
import {
  buildMonacoEditorOptions,
  type EditorPreferences,
} from "@/features/preferences/model/editor";
import {
  EDITOR_PREVIEW_CODE,
  getEditorPreviewThemeLabel,
} from "@/features/preferences/model/editorPreview";
import {
  defineCodeFightMonacoThemes,
  getCurrentAppTheme,
  resolveMonacoThemeName,
} from "@/features/preferences/model/editorMonaco";
import { cn } from "@/shared/lib/cn";
import { EditorSettingsSectionCard } from "./EditorSettingsLayout";

loader.config({ monaco });

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="challenge-code-block flex h-full min-h-64 items-center justify-center text-[13px] text-(--app-text-faint)">
      Loading preview
    </div>
  ),
});

type Props = Readonly<{
  preferences: EditorPreferences;
}>;

type PreviewBadgeProps = Readonly<{
  label: string;
  value: string;
}>;

function PreviewBadge({ label, value }: PreviewBadgeProps) {
  return (
    <div className="rounded-2xl border border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) px-3 py-2">
      <div className="text-[10px] font-semibold tracking-[0.16em] text-(--app-text-faint) uppercase">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-(--app-text-strong)">{value}</div>
    </div>
  );
}

export function EditorSettingsPreview({ preferences }: Props) {
  const monacoInstance = useMonaco();
  const [appTheme, setAppTheme] = useState<"dark" | "light">(() => getCurrentAppTheme());
  const [isExpanded, setIsExpanded] = useState(true);

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
    () => resolveMonacoThemeName(appTheme, preferences.useAppTheme),
    [appTheme, preferences.useAppTheme],
  );

  useEffect(() => {
    if (!monacoInstance) {
      return;
    }

    monacoInstance.editor.setTheme(editorTheme);
  }, [editorTheme, monacoInstance]);

  const editorOptions = useMemo(
    () => ({
      ...buildMonacoEditorOptions(preferences),
      readOnly: true,
      domReadOnly: true,
      contextmenu: false,
      quickSuggestions: false,
      folding: false,
      lineNumbersMinChars: 3,
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    }),
    [preferences],
  );

  return (
    <EditorSettingsSectionCard>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl xl:min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold text-(--app-text-strong) sm:text-lg">
              Live preview
            </h2>

            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((currentValue) => !currentValue)}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) px-3 text-xs font-semibold text-(--app-text-muted) transition hover:border-(--app-option-active-border) hover:text-(--app-text-strong) focus:ring-2 focus:ring-blue-400/30 focus:outline-none"
            >
              {isExpanded ? "Collapse" : "Expand"}
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isExpanded && "rotate-180",
                )}
                strokeWidth={2}
              />
            </button>
          </div>

          <p className="mt-1 text-sm leading-6 text-(--app-text-muted)">
            A compact read-only Monaco preview that updates instantly while you change
            settings.
          </p>
        </div>

        <div className="flex flex-nowrap gap-2 overflow-x-auto xl:shrink-0">
          <PreviewBadge label="Theme" value={getEditorPreviewThemeLabel(editorTheme)} />
          <PreviewBadge label="Font" value={`${preferences.fontSize}px`} />
          <PreviewBadge label="Wrap" value={preferences.wordWrap} />
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out",
          isExpanded
            ? "mt-5 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="overflow-hidden rounded-2xl border border-(--app-surface-code-border) bg-(--app-surface-code)">
            <div className="flex h-10 items-center justify-between border-b border-(--app-surface-code-border) bg-(--app-surface-code-topbar) px-3 sm:px-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
              </div>

              <span className="font-accent text-[12px] text-(--app-text-faint)">
                preview.ts
              </span>
            </div>

            <div className="h-64 sm:h-72 lg:h-80">
              <MonacoEditor
                height="100%"
                language="typescript"
                theme={editorTheme}
                value={EDITOR_PREVIEW_CODE}
                beforeMount={defineCodeFightMonacoThemes}
                options={editorOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </EditorSettingsSectionCard>
  );
}
