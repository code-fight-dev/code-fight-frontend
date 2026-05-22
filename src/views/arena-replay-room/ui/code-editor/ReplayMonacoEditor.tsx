"use client";

import dynamic from "next/dynamic";
import { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import type { editor } from "monaco-editor";
import { defineCodeFightMonacoThemes } from "@/features/preferences";
import { ReplayMonacoLoadingView } from "./ReplayMonacoLoadingView";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <ReplayMonacoLoadingView />,
});

type Props = {
  language: string;
  value: string;
  editorTheme: string;
  editorOptions: editor.IStandaloneEditorConstructionOptions;
};

export function ReplayMonacoEditor({
  language,
  value,
  editorTheme,
  editorOptions,
}: Props) {
  const monacoInstance = useMonaco();

  useEffect(() => {
    if (!monacoInstance) {
      return;
    }

    monacoInstance.editor.setTheme(editorTheme);
  }, [editorTheme, monacoInstance]);

  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme={editorTheme}
      value={value}
      beforeMount={defineCodeFightMonacoThemes}
      options={editorOptions}
    />
  );
}
