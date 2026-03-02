"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import type { FormEvent } from "react";
import { getAuthSubmitErrorMessage, getOAuthErrorMessage } from "./errors";
import type { AuthPageConfig } from "./types";
import { submitAuth } from "../api/auth";

type Options = {
  config: AuthPageConfig;
  oauthErrorCode: string | null;
};

export function useCredentialsAuthForm({ config, oauthErrorCode }: Options) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    getOAuthErrorMessage(oauthErrorCode),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    if (config.terms && !formData.get("terms")) {
      setErrorMessage("You must accept the terms to continue.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (config.mode === "signup") {
        await submitAuth("signup", {
          username: String(formData.get("username") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
      } else {
        await submitAuth("signin", {
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
      }

      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(
        getAuthSubmitErrorMessage(error instanceof Error ? error.message : ""),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    errorMessage,
    handleSubmit,
    isSubmitting,
  };
}
