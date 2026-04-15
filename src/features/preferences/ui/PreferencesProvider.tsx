"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/features/preferences/model/editor";
import {
  applyPreferencesToDocument,
  persistPreferences,
  readPreferencesFromStorage,
} from "@/features/preferences/model/document";
import type {
  MotionPreference,
  PreferencesState,
  ThemePreference,
} from "@/features/preferences/model/types";

type PreferencesContextValue = {
  preferences: PreferencesState;
  setTheme: (theme: ThemePreference) => void;
  setMotion: (motion: MotionPreference) => void;
  updateEditorPreferences: (patch: Partial<EditorPreferences>) => void;
  resetEditorPreferences: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type Props = {
  children: React.ReactNode;
  initialPreferences: PreferencesState;
};

export function PreferencesProvider({ children, initialPreferences }: Props) {
  const [preferences, setPreferences] = useState<PreferencesState>(() => {
    if (typeof window === "undefined") {
      return initialPreferences;
    }

    return readPreferencesFromStorage();
  });

  useEffect(() => {
    applyPreferencesToDocument(preferences);
    persistPreferences(preferences);
  }, [preferences]);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setTheme: (theme) => {
          setPreferences((currentPreferences) => ({ ...currentPreferences, theme }));
        },
        setMotion: (motion) => {
          setPreferences((currentPreferences) => ({ ...currentPreferences, motion }));
        },
        updateEditorPreferences: (patch) => {
          setPreferences((currentPreferences) => ({
            ...currentPreferences,
            editor: {
              ...currentPreferences.editor,
              ...patch,
            },
          }));
        },
        resetEditorPreferences: () => {
          setPreferences((currentPreferences) => ({
            ...currentPreferences,
            editor: DEFAULT_EDITOR_PREFERENCES,
          }));
        },
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const value = useContext(PreferencesContext);

  if (!value) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }

  return value;
}
