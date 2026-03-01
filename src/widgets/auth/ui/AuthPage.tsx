"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AmbientGrid } from "@/shared/ui/AmbientGrid";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import { cn } from "@/shared/lib/cn";
import type { AuthPageConfig } from "../model/types";
import { AuthForm } from "./AuthForm";
import { AuthSocialButton } from "./AuthSocialButton";

type Props = {
  config: AuthPageConfig;
};

export function AuthPage({ config }: Props) {
  const searchParams = useSearchParams();
  const isCardLayout = config.layout === "card";
  const oauthErrorCode = searchParams.get("error");

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 lg:py-18">
      <AmbientGrid className="mask-[radial-gradient(circle_at_center,black,transparent_88%)] opacity-65" />

      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-[8%] h-80 w-80 rounded-full bg-[#1d4ed8]/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -bottom-8 h-96 w-96 rounded-full bg-[#2563eb]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[18%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.04),transparent)]"
      />

      <Container className="relative">
        <div className="flex min-h-[calc(100dvh-81px-5rem)] items-center justify-center">
          <Reveal
            variant="scale"
            className={cn(
              "w-full",
              isCardLayout
                ? "mx-auto max-w-150 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,12,25,0.92)_0%,rgba(8,13,24,0.88)_100%)] px-6 py-8 shadow-[0_30px_90px_rgba(3,7,18,0.34)] backdrop-blur-xl sm:px-10 sm:py-11"
                : "mx-auto max-w-136 py-6 sm:py-8",
            )}
          >
            <div className="mx-auto w-full max-w-124">
              <div className="flex justify-center">
                <BrandMark
                  className="h-15 w-15 rounded-[22px] shadow-[0_18px_40px_rgba(37,99,235,0.24)]"
                  iconClassName="h-9 w-9"
                />
              </div>

              <h1 className="mt-7 text-center text-[2.3rem] font-semibold tracking-[-0.06em] text-white sm:text-[3rem]">
                {config.title}
              </h1>

              <p className="mx-auto mt-3 max-w-md text-center text-[1rem] leading-[1.72] tracking-[-0.03em] text-white/50 sm:text-[1.08rem]">
                {config.description}
              </p>

              <div className="mt-8 grid gap-3">
                <AuthSocialButton provider="github" mode={config.mode} />
                <AuthSocialButton provider="google" mode={config.mode} />
              </div>

              <AuthForm config={config} oauthErrorCode={oauthErrorCode} />

              <div className="mt-8 text-center text-[15px] tracking-[-0.03em] text-white/46">
                {config.footerPrompt}{" "}
                <Link
                  href={config.footerLinkHref}
                  className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  {config.footerLinkLabel}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
