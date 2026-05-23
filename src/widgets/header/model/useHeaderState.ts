"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { shouldReduceMotion } from "@/shared/lib/motion";

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
      const reducedMotion = shouldReduceMotion();

      setIsScrolled((currentValue) =>
        currentValue === nextValue ? currentValue : nextValue,
      );

      if (reducedMotion) {
        setScrollProgress((currentValue) => (currentValue === 0 ? currentValue : 0));
        return;
      }

      const nextProgress = Math.round(Math.min(scrollY / 320, 1) * 100) / 100;
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
  const effectiveScrollProgress = shouldReduceMotion() ? 0 : scrollProgress;

  const surfaceStyles: HeaderSurfaceStyles = {
    leftGlowStyle: {
      transform: `translate(${effectiveScrollProgress * 28}px, ${effectiveScrollProgress * 14}px) scale(${1 - effectiveScrollProgress * 0.08})`,
      opacity: 0.7 + effectiveScrollProgress * 0.2,
    },
    rightGlowStyle: {
      transform: `translate(${-effectiveScrollProgress * 34}px, ${effectiveScrollProgress * 18}px) scale(${1 - effectiveScrollProgress * 0.12})`,
      opacity: 0.68 + effectiveScrollProgress * 0.18,
    },
    shimmerStyle: {
      transform: `translateX(${effectiveScrollProgress * 180 - 120}px) rotate(8deg)`,
      opacity: 0.08 + effectiveScrollProgress * 0.14,
    },
    trailStyle: {
      transform: `translateX(${effectiveScrollProgress * 64}px)`,
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
