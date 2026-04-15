import { DEFAULT_EDITOR_PREFERENCES } from "./editorConstants";
import type { EditorPreferences } from "./editorTypes";

export function isDefaultEditorPreferences(editor: EditorPreferences) {
  return (
    Object.entries(DEFAULT_EDITOR_PREFERENCES) as Array<
      [keyof EditorPreferences, EditorPreferences[keyof EditorPreferences]]
    >
  ).every(([key, value]) => editor[key] === value);
}
