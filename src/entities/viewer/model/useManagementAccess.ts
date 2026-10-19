"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { isManagementAccessError } from "@/shared/api/management";
import type { ManagementError } from "@/shared/api/management";
import { useViewerSession } from "../ui/ViewerSessionProvider";

export function useManagementAccess() {
  const { revalidate, setViewer } = useViewerSession();
  const { refresh } = useRouter();
  const [accessError, setAccessError] = useState<ManagementError | null>(null);
  const denied = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const rejectAccess = useCallback(
    (error: unknown) => {
      if (!isManagementAccessError(error)) return false;
      if (denied.current) return true;
      denied.current = true;
      setAccessError(error);
      if (error.status === 401) setViewer(null);
      void revalidate()
        .catch(() => undefined)
        .finally(() => {
          if (mounted.current) refresh();
        });
      return true;
    },
    [revalidate, setViewer, refresh],
  );

  return { accessError, rejectAccess };
}
