export function shouldReduceMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    document.documentElement.dataset.motion === "disabled" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
