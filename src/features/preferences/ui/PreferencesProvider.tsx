"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  applyPreferencesToDocument,
  persistPreferences,
  readPreferencesFromDocument,
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
