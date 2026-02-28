"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, House } from "lucide-react";
import { Button } from "@/shared/ui/Button";

export function NotFoundActions() {
  const router = useRouter();

  function handleGoBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
      <Button href="/" className="min-h-13 rounded-2xl sm:min-h-14 sm:min-w-56">
        <House className="h-4.5 w-4.5" strokeWidth={1.9} />
        Return Home
      </Button>

      <Button
        variant="secondary"
        onClick={handleGoBack}
        className="min-h-13 cursor-pointer rounded-2xl sm:min-h-14 sm:min-w-52"
      >
        <ArrowLeft className="h-4.5 w-4.5" strokeWidth={1.9} />
        Go Back
      </Button>
    </div>
  );
}
