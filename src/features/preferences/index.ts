export { EditorSettingsPanel } from "./ui/EditorSettingsPanel";
export { getPreferencesInitScript } from "./model/initScript";
export type { MotionPreference, PreferencesState, ThemePreference } from "./model/types";
export { PreferencesProvider, usePreferences } from "./ui/PreferencesProvider";
export { buildMonacoEditorOptions } from "./model/editor";
export {
  defineCodeFightMonacoThemes,
  getCurrentAppTheme,
  resolveMonacoThemeName,
} from "./model/editorMonaco";
export {
  AppearanceSettingsPanel,
  PerformanceSettingsPanel,
  PreferencesSettingsPanel,
} from "./ui/PreferencesSettingsPanel";
