"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { useAuthForm } from "../model/useAuthForm";
import type { AuthPageConfig } from "../model/types";
import { AuthField } from "./AuthField";

type Props = {
  config: AuthPageConfig;
  oauthErrorCode: string | null;
};

export function AuthForm({ config, oauthErrorCode }: Props) {
  const { errorMessage, handleSubmit, isSubmitting } = useAuthForm({
    config,
    oauthErrorCode,
  });

  return (
    <form className="mt-8" onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/8" />
        <div className="font-accent text-[11px] tracking-[0.18em] text-white/28 uppercase">
          {config.dividerLabel}
        </div>
        <div className="h-px flex-1 bg-white/8" />
      </div>

      <div className="mt-8 grid gap-5">
        {config.fields.map((field) => (
          <AuthField key={field.id} field={field} disabled={isSubmitting} />
        ))}
      </div>

      {config.terms ? (
        <div className="mt-5 flex items-start gap-3 text-[15px] leading-[1.7] tracking-[-0.03em] text-white/52">
          <input
            id={`${config.mode}-terms`}
            name="terms"
            type="checkbox"
            disabled={isSubmitting}
            aria-label="Accept terms and privacy policy"
            className="mt-0.5 h-5 w-5 shrink-0 rounded-md border border-white/10 bg-transparent accent-[#3466f6]"
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
          className="mt-5 rounded-2xl border border-red-400/18 bg-red-500/8 px-4 py-3 text-[14px] tracking-[-0.02em] text-red-100/88"
        >
          {errorMessage}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 min-h-14.5 w-full rounded-2xl bg-[#3466f6] text-[15px] shadow-[0_18px_44px_rgba(37,99,235,0.28)] hover:bg-[#3d70ff] hover:shadow-[0_24px_54px_rgba(37,99,235,0.38)] sm:text-[16px]"
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
