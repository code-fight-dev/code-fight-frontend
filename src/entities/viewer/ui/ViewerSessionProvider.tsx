"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { HOME_HREF } from "@/shared/config/routes";
import { getCurrentViewer, signOutViewer } from "../api/session";
import type { Viewer } from "../model/types";

type ViewerSessionContextValue = {
  viewer: Viewer | null;
  isLoading: boolean;
  isSigningOut: boolean;
  setViewer: (viewer: Viewer | null) => void;
  revalidate: () => Promise<Viewer | null>;
  signOut: () => Promise<void>;
};

const ViewerSessionContext = createContext<ViewerSessionContextValue | null>(null);

type Props = {
  children: React.ReactNode;
  initialViewer: Viewer | null;
};

export function ViewerSessionProvider({ children, initialViewer }: Props) {
  const router = useRouter();
  const [viewer, setViewerState] = useState<Viewer | null>(initialViewer);
  const [isLoading, setIsLoading] = useState(false);
  const activeRevalidation = useRef<AbortController | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const setViewer = useCallback((next: Viewer | null) => {
    activeRevalidation.current?.abort();
    activeRevalidation.current = null;
    setIsLoading(false);
    setViewerState(next);
  }, []);

  const revalidate = useCallback(async () => {
    activeRevalidation.current?.abort();
    const controller = new AbortController();
    activeRevalidation.current = controller;
    setIsLoading(true);
    try {
      const next = await getCurrentViewer(controller.signal);
      controller.signal.throwIfAborted();
      setViewerState(next);
      return next;
    } finally {
      if (activeRevalidation.current === controller) {
        activeRevalidation.current = null;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setViewer(initialViewer);
  }, [initialViewer, setViewer]);

  useEffect(() => () => activeRevalidation.current?.abort(), []);

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
        isLoading,
        isSigningOut,
        setViewer,
        revalidate,
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
