"use client";

import dynamic from "next/dynamic";
import { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import type { editor } from "monaco-editor";
import { defineCodeFightMonacoThemes } from "@/features/preferences/model/editorMonaco";
import { MonacoLoadingView } from "./MonacoLoadingView";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <MonacoLoadingView />,
});

type Props = {
  language: string;
  value: string;
  editorTheme: string;
  editorOptions: editor.IStandaloneEditorConstructionOptions;
  onChange: (value: string) => void;
};

export function ConfiguredMonacoEditor({
  language,
  value,
  editorTheme,
  editorOptions,
  onChange,
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
      onChange={(nextValue) => onChange(nextValue ?? "")}
      options={editorOptions}
    />
  );
}
