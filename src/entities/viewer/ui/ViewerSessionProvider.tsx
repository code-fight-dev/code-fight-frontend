"use client";

import { useRouter } from "next/navigation";
import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { HOME_HREF } from "@/shared/config/routes";
import { signOutViewer } from "../api/session";
import type { Viewer } from "../model/types";

type ViewerSessionContextValue = {
  viewer: Viewer | null;
  isLoading: boolean;
  isSigningOut: boolean;
  setViewer: (viewer: Viewer | null) => void;
  signOut: () => Promise<void>;
};

const ViewerSessionContext = createContext<ViewerSessionContextValue | null>(null);

type Props = {
  children: React.ReactNode;
  initialViewer: Viewer | null;
};

export function ViewerSessionProvider({ children, initialViewer }: Props) {
  const router = useRouter();
  const [viewer, setViewer] = useState<Viewer | null>(initialViewer);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setViewer(initialViewer);
  }, [initialViewer]);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOutViewer();
      setViewer(null);

      startTransition(() => {
        router.push(HOME_HREF);
        router.refresh();
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <ViewerSessionContext.Provider
      value={{
        viewer,
        isLoading: false,
        isSigningOut,
        setViewer,
        signOut: handleSignOut,
      }}
    >
      {children}
    </ViewerSessionContext.Provider>
  );
}

export function useViewerSession() {
  const value = useContext(ViewerSessionContext);

  if (!value) {
    throw new Error("useViewerSession must be used within ViewerSessionProvider");
  }

  return value;
}
