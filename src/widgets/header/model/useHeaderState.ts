"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

export type HeaderSurfaceStyles = {
  leftGlowStyle: CSSProperties;
  rightGlowStyle: CSSProperties;
  shimmerStyle: CSSProperties;
  trailStyle: CSSProperties;
};

export function useHeaderState() {
  const [isReady, setIsReady] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let frameId = 0;

    const syncScrollState = () => {
      frameId = 0;
      const scrollY = window.scrollY;
      const nextValue = scrollY > 24;
      const nextProgress = Math.round(Math.min(scrollY / 320, 1) * 100) / 100;

      setIsScrolled((currentValue) =>
        currentValue === nextValue ? currentValue : nextValue,
      );
      setScrollProgress((currentValue) =>
        currentValue === nextProgress ? currentValue : nextProgress,
      );
    };

    const handleScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(syncScrollState);
    };

    frameId = window.requestAnimationFrame(() => {
      setIsReady(true);
      syncScrollState();
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const closeMenuOnResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeMenuOnResize);

    return () => {
      window.removeEventListener("resize", closeMenuOnResize);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const previousHtmlOverflow = htmlStyle.overflow;
    const previousBodyOverflow = bodyStyle.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    htmlStyle.overflow = "hidden";
    bodyStyle.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      htmlStyle.overflow = previousHtmlOverflow;
      bodyStyle.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const isElevated = isScrolled || isMenuOpen;

  const surfaceStyles: HeaderSurfaceStyles = {
    leftGlowStyle: {
      transform: `translate3d(${scrollProgress * 28}px, ${scrollProgress * 14}px, 0) scale(${1 - scrollProgress * 0.08})`,
      opacity: 0.7 + scrollProgress * 0.2,
    },
    rightGlowStyle: {
      transform: `translate3d(${-scrollProgress * 34}px, ${scrollProgress * 18}px, 0) scale(${1 - scrollProgress * 0.12})`,
      opacity: 0.68 + scrollProgress * 0.18,
    },
    shimmerStyle: {
      transform: `translate3d(${scrollProgress * 180 - 120}px, 0, 0) rotate(8deg)`,
      opacity: 0.08 + scrollProgress * 0.14,
    },
    trailStyle: {
      transform: `translate3d(${scrollProgress * 64}px, 0, 0)`,
    },
  };

  return {
    isReady,
    isElevated,
    isMenuOpen,
    surfaceStyles,
    closeMenu: () => setIsMenuOpen(false),
    toggleMenu: () => setIsMenuOpen((currentValue) => !currentValue),
  };
}
