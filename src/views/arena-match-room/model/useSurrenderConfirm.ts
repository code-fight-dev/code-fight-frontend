import { useCallback, useEffect, useState } from "react";

type Params = {
  canSurrender: boolean;
  isSurrendering: boolean;
  onSurrender: () => void;
};

type Result = {
  isDialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  confirmSurrender: () => void;
};

export function useSurrenderConfirm({
  canSurrender,
  isSurrendering,
  onSurrender,
}: Params): Result {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isDialogOpen = isConfirmOpen && canSurrender && !isSurrendering;

  const openDialog = useCallback(() => {
    if (!canSurrender || isSurrendering) {
      return;
    }

    setIsConfirmOpen(true);
  }, [canSurrender, isSurrendering]);

  const closeDialog = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const confirmSurrender = useCallback(() => {
    if (!canSurrender || isSurrendering) {
      return;
    }

    onSurrender();
    setIsConfirmOpen(false);
  }, [canSurrender, isSurrendering, onSurrender]);

  useEffect(() => {
    if (!isDialogOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDialog, isDialogOpen]);

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    confirmSurrender,
  };
}
