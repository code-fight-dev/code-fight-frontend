"use client";

import { Github } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { getOAuthStartUrl } from "../api/auth";
import type { AuthMode } from "../model/types";

type Props = {
  provider: "github" | "google";
  mode: AuthMode;
  disabled?: boolean;
};

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M21.8 12.23c0-.74-.06-1.29-.2-1.86H12v3.52h5.64c-.11.87-.74 2.18-2.14 3.06l-.02.12 2.87 2.18.2.02c1.87-1.69 2.95-4.18 2.95-7.04Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.89 6.77-2.42l-3.22-2.32c-.86.58-2.02.99-3.55.99-2.7 0-4.99-1.74-5.8-4.15l-.12.01-2.98 2.26-.04.11C4.74 19.71 8.09 22 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.2 14.1A5.84 5.84 0 0 1 5.86 12c0-.73.13-1.44.34-2.1l-.01-.14-3.02-2.3-.1.05A9.71 9.71 0 0 0 2 12c0 1.58.39 3.08 1.07 4.49l3.13-2.39Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.75c1.93 0 3.22.82 3.96 1.5l2.9-2.77C17.07 2.9 14.76 2 12 2 8.09 2 4.74 4.29 3.07 7.52l3.13 2.39c.82-2.41 3.11-4.16 5.8-4.16Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function OAuthButton({ provider, mode, disabled = false }: Props) {
  const label = provider === "github" ? "Continue with GitHub" : "Continue with Google";
  const href = getOAuthStartUrl(provider, mode);

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={disabled}
      onClick={() => {
        window.location.assign(href);
      }}
      className="min-h-14.5 w-full justify-center rounded-2xl text-[15px]"
    >
      {provider === "github" ? (
        <Github className="h-4.5 w-4.5" strokeWidth={1.9} />
      ) : (
        <GoogleIcon />
      )}
      {label}
    </Button>
  );
}
