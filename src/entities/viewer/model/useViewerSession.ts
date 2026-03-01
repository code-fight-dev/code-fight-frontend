"use client";

import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { getCurrentViewer, signOutViewer } from "../api/auth";
import type { Viewer } from "./types";

export function useViewerSession() {
  const pathname = usePathname();
  const router = useRouter();
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void getCurrentViewer(controller.signal)
      .then((nextViewer) => {
        setViewer(nextViewer);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setViewer(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [pathname]);

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

  return {
    viewer,
    isLoading,
    isSigningOut,
    signOut: handleSignOut,
  };
}
