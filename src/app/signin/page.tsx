import type { Metadata } from "next";
import { SIGN_IN_AUTH_PAGE } from "@/features/auth";
import { AuthPageView } from "@/views/auth";
import { getOAuthErrorCode } from "@/views/auth/server";

export const metadata: Metadata = {
  title: "Sign In | CodeFight",
  description: "Sign in to CodeFight and continue your coding journey.",
  alternates: {
    canonical: "/signin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const { error } = await searchParams;

  return (
    <AuthPageView config={SIGN_IN_AUTH_PAGE} oauthErrorCode={getOAuthErrorCode(error)} />
  );
}
