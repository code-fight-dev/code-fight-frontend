import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

type Params = {
  isOpen: boolean;
  listboxRef: RefObject<HTMLDivElement | null>;
  onRequestClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const VIEWPORT_PADDING = 12;
const LISTBOX_GAP = 8;
const MIN_LISTBOX_HEIGHT = 160;
const MAX_LISTBOX_HEIGHT = 256;

export function useSelectListboxPosition({
  isOpen,
  listboxRef,
  onRequestClose,
  triggerRef,
}: Params) {
  const [listboxStyle, setListboxStyle] = useState<CSSProperties>();

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    function updateListboxPosition() {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
      const spaceAbove = rect.top - VIEWPORT_PADDING;
      const opensAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
      const availableSpace = opensAbove ? spaceAbove : spaceBelow;
      const maxHeight = Math.min(
        MAX_LISTBOX_HEIGHT,
        Math.max(MIN_LISTBOX_HEIGHT, availableSpace - LISTBOX_GAP),
      );

      setListboxStyle({
        left: rect.left,
        maxHeight,
        top: opensAbove
          ? Math.max(VIEWPORT_PADDING, rect.top - maxHeight - LISTBOX_GAP)
          : rect.bottom + LISTBOX_GAP,
        width: rect.width,
      });
    }

    function handleScroll(event: Event) {
      const target = event.target as Node | null;

      if (target && listboxRef.current?.contains(target)) {
        return;
      }

      onRequestClose();
    }

    updateListboxPosition();
    window.addEventListener("resize", updateListboxPosition);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", updateListboxPosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, listboxRef, onRequestClose, triggerRef]);

  return listboxStyle;
}
