"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { shouldReduceMotion } from "@/shared/lib/motion";

type ToastProps = Readonly<{
  message: string | null;
}>;

export function Toast({ message }: ToastProps) {
  const [renderedMessage, setRenderedMessage] = useState<string | null>(message);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      if (shouldReduceMotion()) {
        const frameId = window.requestAnimationFrame(() => {
          setRenderedMessage(message);
          setIsVisible(true);
        });

        return () => {
          window.cancelAnimationFrame(frameId);
        };
      }

      let enterFrameId = 0;
      const mountFrameId = window.requestAnimationFrame(() => {
        setRenderedMessage(message);
        setIsVisible(false);

        enterFrameId = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });

      return () => {
        window.cancelAnimationFrame(mountFrameId);
        if (enterFrameId) {
          window.cancelAnimationFrame(enterFrameId);
        }
      };
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(false);
    });

    const timeoutId = window.setTimeout(() => {
      setRenderedMessage(null);
    }, 260);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  if (!renderedMessage) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-2 z-60 flex justify-center px-4 sm:top-3"
    >
      <div
        className={cn(
          "flex min-h-13 w-full max-w-fit items-center gap-3 rounded-[18px] border border-white/10 bg-[rgba(18,18,20,0.94)] px-4 py-3 text-[15px] tracking-[-0.02em] text-white shadow-[0_18px_42px_rgba(2,6,23,0.34)] backdrop-blur-xl transition-all duration-300 ease-out",
          isVisible
            ? "transform-none opacity-100"
            : "pointer-events-none -translate-y-3 scale-95 opacity-0",
        )}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" strokeWidth={2.2} />
        <span>{renderedMessage}</span>
      </div>
    </div>
  );
}
