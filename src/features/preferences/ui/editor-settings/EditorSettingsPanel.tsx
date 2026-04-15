"use client";

import { useEffect, useState } from "react";
import { isDefaultEditorPreferences } from "@/features/preferences/model/editor";
import { usePreferences } from "@/features/preferences/ui/PreferencesProvider";
import { Toast } from "@/shared/ui/Toast";
import { EditorSettingsHeader } from "./EditorSettingsHeader";
import { EditorBehaviorSection, EditorTypographySection } from "./EditorSettingsSections";
import { EditorSettingsPreview } from "./EditorSettingsPreview";

const EDITOR_SETTINGS_TOAST_DURATION_MS = 2800;

export function EditorSettingsPanel() {
  const { preferences, updateEditorPreferences, resetEditorPreferences } =
    usePreferences();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const editor = preferences.editor;
  const isDefault = isDefaultEditorPreferences(editor);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, EDITOR_SETTINGS_TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  function handleResetEditorPreferences() {
    resetEditorPreferences();
    setToastMessage("Editor settings reset to defaults");
  }

  return (
    <>
      <Toast message={toastMessage} />

      <div className="grid gap-5 sm:gap-6">
        <EditorSettingsHeader
          isDefault={isDefault}
          onReset={handleResetEditorPreferences}
        />

        <EditorSettingsPreview preferences={editor} />
        <EditorBehaviorSection editor={editor} onChange={updateEditorPreferences} />
        <EditorTypographySection editor={editor} onChange={updateEditorPreferences} />
      </div>
    </>
  );
}
