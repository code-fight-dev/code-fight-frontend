"use client";

import { createContext, useContext, useState } from "react";
import {
  applyPreferencesToDocument,
  persistPreferences,
  readPreferencesFromDocument,
} from "../model/document";
import type { MotionPreference, PreferencesState, ThemePreference } from "../model/types";

type PreferencesContextValue = {
  preferences: PreferencesState;
  setTheme: (theme: ThemePreference) => void;
  setMotion: (motion: MotionPreference) => void;
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

    return readPreferencesFromDocument();
  });

  function updatePreferences(nextPreferences: PreferencesState) {
    setPreferences(nextPreferences);
    applyPreferencesToDocument(nextPreferences);
    persistPreferences(nextPreferences);
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setTheme: (theme) => updatePreferences({ ...preferences, theme }),
        setMotion: (motion) => updatePreferences({ ...preferences, motion }),
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
