"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import type { SubmitEvent } from "react";
import { useViewerSession } from "@/entities/viewer";
import type { Viewer } from "@/entities/viewer";
import { HOME_HREF } from "@/shared/config/routes";
import { getAuthSubmitErrorMessage, getOAuthErrorMessage } from "./errors";
import type { AuthPageConfig } from "./types";
import { submitAuth } from "../api/auth";

type Options = {
  config: AuthPageConfig;
  oauthErrorCode: string | null;
};

type CredentialsAuthFormValues = {
  email: string;
  password: string;
  username: string;
  acceptedTerms: boolean;
};

const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCredentialsAuthFormValues(formData: FormData): CredentialsAuthFormValues {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    username: String(formData.get("username") ?? "").trim(),
    acceptedTerms: formData.has("terms"),
  };
}

function validateCredentialsAuthForm(
  config: AuthPageConfig,
  values: CredentialsAuthFormValues,
): string | null {
  if (config.terms && !values.acceptedTerms) {
    return "You must accept the terms to continue.";
  }

  if (!values.email) {
    return "Email is required.";
  }

  if (!SIMPLE_EMAIL_PATTERN.test(values.email)) {
    return "Enter a valid email address.";
  }

  if (!values.password) {
    return "Password is required.";
  }

  if (config.mode === "signup") {
    if (!values.username) {
      return "Username is required.";
    }

    if (/\s/.test(values.username)) {
      return "Username must not contain spaces.";
    }
  }

  return null;
}

async function submitCredentialsForm(
  config: AuthPageConfig,
  values: CredentialsAuthFormValues,
): Promise<Viewer> {
  if (config.mode === "signup") {
    return submitAuth("signup", {
      username: values.username,
      email: values.email,
      password: values.password,
    });
  }

  return submitAuth("signin", {
    email: values.email,
    password: values.password,
  });
}

export function useCredentialsAuthForm({ config, oauthErrorCode }: Options) {
  const router = useRouter();
  const { setViewer } = useViewerSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    getOAuthErrorMessage(oauthErrorCode),
  );

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const values = readCredentialsAuthFormValues(new FormData(event.currentTarget));
    const validationError = validateCredentialsAuthForm(config, values);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const authenticatedViewer = await submitCredentialsForm(config, values);

      setViewer(authenticatedViewer);

      startTransition(() => {
        router.push(HOME_HREF);
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
