"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { useCredentialsAuthForm } from "../model/useCredentialsAuthForm";
import type { AuthPageConfig } from "../model/types";
import { AuthField } from "./AuthField";

type Props = {
  config: AuthPageConfig;
  oauthErrorCode: string | null;
};

export function CredentialsAuthForm({ config, oauthErrorCode }: Props) {
  const { errorMessage, handleSubmit, isSubmitting } = useCredentialsAuthForm({
    config,
    oauthErrorCode,
  });

  return (
    <form className="mt-8" onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-(--app-surface-soft-border)" />
        <div className="font-accent text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
          {config.dividerLabel}
        </div>
        <div className="h-px flex-1 bg-(--app-surface-soft-border)" />
      </div>

      <div className="mt-8 grid gap-5">
        {config.fields.map((field) => (
          <AuthField key={field.id} field={field} disabled={isSubmitting} />
        ))}
      </div>

      {config.terms ? (
        <div className="mt-5 flex items-start gap-3 text-[15px] leading-[1.7] tracking-[-0.03em] text-(--app-text-soft)">
          <input
            id={`${config.mode}-terms`}
            name="terms"
            type="checkbox"
            disabled={isSubmitting}
            aria-label="Accept terms and privacy policy"
            className="mt-0.5 h-5 w-5 shrink-0 rounded-md border border-(--app-input-border) bg-transparent accent-[#3466f6]"
          />
          <span>
            I agree to the{" "}
            <Link
              href={config.terms.serviceHref}
              className="text-blue-400 transition-colors hover:text-blue-300"
            >
              {config.terms.serviceLabel}
            </Link>{" "}
            and{" "}
            <Link
              href={config.terms.privacyHref}
              className="text-blue-400 transition-colors hover:text-blue-300"
            >
              {config.terms.privacyLabel}
            </Link>
            .
          </span>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          aria-live="polite"
          className="mt-5 rounded-2xl border border-red-400/18 bg-red-500/8 px-4 py-3 text-[14px] tracking-[-0.02em] text-red-500"
        >
          {errorMessage}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 min-h-14.5 w-full rounded-2xl text-[15px] sm:text-[16px]"
      >
        {isSubmitting
          ? config.mode === "signup"
            ? "Creating account..."
            : "Signing in..."
          : config.submitLabel}
      </Button>
    </form>
  );
}
