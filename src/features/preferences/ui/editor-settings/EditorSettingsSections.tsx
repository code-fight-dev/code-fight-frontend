"use client";

import {
  EDITOR_CURSOR_BLINKING_OPTIONS,
  EDITOR_FONT_FAMILY_OPTIONS,
  EDITOR_WORD_WRAP_OPTIONS,
  type EditorPreferences,
} from "@/features/preferences/model/editor";
import { EditorSettingsSectionHeading } from "./EditorSettingsLayout";
import { SelectField, SliderField, ToggleField } from "./EditorSettingsControls";

type Props = Readonly<{
  editor: EditorPreferences;
  onChange: (patch: Partial<EditorPreferences>) => void;
}>;

export function EditorBehaviorSection({ editor, onChange }: Props) {
  return (
    <section className="grid gap-4">
      <EditorSettingsSectionHeading
        title="Behavior"
        description="Control theme sync, typing behavior, and navigation inside the editor."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ToggleField
          label="Use app theme"
          description="Monaco follows the current site theme. Otherwise the editor stays dark."
          value={editor.useAppTheme}
          onChange={(useAppTheme) => onChange({ useAppTheme })}
        />

        <SelectField
          label="Cursor blinking"
          description="Choose how the caret animates while typing."
          value={editor.cursorBlinking}
          options={EDITOR_CURSOR_BLINKING_OPTIONS}
          onChange={(cursorBlinking) => onChange({ cursorBlinking })}
        />

        <SelectField
          label="Word wrap"
          description="Control how long lines wrap inside the editor."
          value={editor.wordWrap}
          options={EDITOR_WORD_WRAP_OPTIONS}
          onChange={(wordWrap) => onChange({ wordWrap })}
        />

        <ToggleField
          label="Minimap"
          description="Show or hide the miniature code overview on the right side."
          value={editor.minimap}
          onChange={(minimap) => onChange({ minimap })}
        />

        <ToggleField
          label="Font ligatures"
          description="Enable programming ligatures for supported fonts."
          value={editor.fontLigatures}
          onChange={(fontLigatures) => onChange({ fontLigatures })}
        />

        <ToggleField
          label="Smooth scrolling"
          description="Keep editor scrolling visually smoother."
          value={editor.smoothScrolling}
          onChange={(smoothScrolling) => onChange({ smoothScrolling })}
        />

        <ToggleField
          label="Format on paste"
          description="Allow Monaco to auto-format pasted code when supported."
          value={editor.formatOnPaste}
          onChange={(formatOnPaste) => onChange({ formatOnPaste })}
        />
      </div>
    </section>
  );
}

export function EditorTypographySection({ editor, onChange }: Props) {
  return (
    <section className="grid gap-4">
      <EditorSettingsSectionHeading
        title="Typography and spacing"
        description="Adjust font choice, density, and breathing room inside the code area."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SelectField
          label="Font family"
          description="Choose the mono font stack used inside Monaco."
          hint="Ligatures only appear if the selected font supports them. Fira Code, JetBrains Mono, and Cascadia Code usually show them best."
          value={editor.fontFamily}
          options={EDITOR_FONT_FAMILY_OPTIONS}
          className="app-editor-quiet-field"
          onChange={(fontFamily) => onChange({ fontFamily })}
        />

        <SliderField
          label="Font size"
          description="Controls the editor text size."
          value={editor.fontSize}
          min={12}
          max={24}
          className="app-editor-quiet-field"
          onValueChange={(fontSize) => onChange({ fontSize })}
        />

        <SliderField
          label="Line height"
          description="Controls vertical spacing between code lines."
          value={editor.lineHeight}
          min={18}
          max={36}
          className="app-editor-quiet-field"
          onValueChange={(lineHeight) => onChange({ lineHeight })}
        />

        <SliderField
          label="Tab size"
          description="How many spaces a tab visually occupies."
          value={editor.tabSize}
          min={2}
          max={8}
          className="app-editor-quiet-field"
          onValueChange={(tabSize) => onChange({ tabSize })}
        />

        <SliderField
          label="Top padding"
          description="Extra space above the first visible line."
          value={editor.paddingTop}
          min={0}
          max={48}
          className="app-editor-quiet-field"
          onValueChange={(paddingTop) => onChange({ paddingTop })}
        />

        <SliderField
          label="Bottom padding"
          description="Extra space below the last visible line."
          value={editor.paddingBottom}
          min={0}
          max={48}
          className="app-editor-quiet-field"
          onValueChange={(paddingBottom) => onChange({ paddingBottom })}
        />
      </div>
    </section>
  );
}
