"use client";

import { cn } from "@/shared/lib/cn";
import { shouldReduceMotion } from "@/shared/lib/motion";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  rootMargin?: string;
  variant?: "up" | "fade" | "scale";
};

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 700,
  distance = 24,
  threshold = 0.12,
  rootMargin = "0px 0px -10% 0px",
  variant = "up",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (shouldReduceMotion()) {
      return;
    }

    let frameId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          frameId = window.requestAnimationFrame(() => {
            setIsVisible(true);
          });
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  const style = {
    "--reveal-delay": `${delay}ms`,
    "--reveal-duration": `${duration}ms`,
    "--reveal-distance": `${distance}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-visible={isVisible}
      data-variant={variant}
      className={cn("reveal", className)}
      style={style}
    >
      {children}
    </div>
  );
}
