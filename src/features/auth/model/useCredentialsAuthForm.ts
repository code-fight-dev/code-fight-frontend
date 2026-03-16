"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import type { SubmitEvent } from "react";
import { getAuthSubmitErrorMessage, getOAuthErrorMessage } from "./errors";
import type { AuthPageConfig } from "./types";
import { submitAuth } from "../api/auth";

type Options = {
  config: AuthPageConfig;
  oauthErrorCode: string | null;
};

const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useCredentialsAuthForm({ config, oauthErrorCode }: Options) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    getOAuthErrorMessage(oauthErrorCode),
  );

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    if (config.terms && !formData.get("terms")) {
      setErrorMessage("You must accept the terms to continue.");
      return;
    }

    try {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      if (!email) {
        setErrorMessage("Email is required.");
        return;
      }

      if (!SIMPLE_EMAIL_PATTERN.test(email)) {
        setErrorMessage("Enter a valid email address.");
        return;
      }

      if (!password) {
        setErrorMessage("Password is required.");
        return;
      }

      if (config.mode === "signup") {
        const username = String(formData.get("username") ?? "").trim();

        if (!username) {
          setErrorMessage("Username is required.");
          return;
        }

        if (/\s/.test(username)) {
          setErrorMessage("Username must not contain spaces.");
          return;
        }

        setIsSubmitting(true);

        await submitAuth("signup", {
          username,
          email,
          password,
        });
      } else {
        setIsSubmitting(true);

        await submitAuth("signin", {
          email,
          password,
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
