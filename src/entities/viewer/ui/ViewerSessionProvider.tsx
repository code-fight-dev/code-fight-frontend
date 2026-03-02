"use client";

import { useRouter } from "next/navigation";
import { createContext, startTransition, useContext, useState } from "react";
import { signOutViewer } from "../api/session";
import type { Viewer } from "../model/types";

type ViewerSessionValue = {
  viewer: Viewer | null;
  isLoading: boolean;
  isSigningOut: boolean;
  signOut: () => Promise<void>;
};

const ViewerSessionContext = createContext<ViewerSessionValue | null>(null);

type Props = {
  children: React.ReactNode;
  initialViewer: Viewer | null;
};

export function ViewerSessionProvider({ children, initialViewer }: Props) {
  const router = useRouter();
  const [viewer, setViewer] = useState<Viewer | null>(initialViewer);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOutViewer();
      setViewer(null);

      startTransition(() => {
        router.push("/");
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
