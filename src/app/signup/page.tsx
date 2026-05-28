import type { Metadata } from "next";
import { SIGN_UP_AUTH_PAGE } from "@/features/auth";
import { AuthPageView } from "@/views/auth";
import { getOAuthErrorCode } from "@/views/auth/server";

export const metadata: Metadata = {
  title: "Sign Up | CodeFight",
  description:
    "Create a CodeFight account to solve challenges and compete in coding duels.",
  alternates: {
    canonical: "/signup",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const { error } = await searchParams;

  return (
    <AuthPageView config={SIGN_UP_AUTH_PAGE} oauthErrorCode={getOAuthErrorCode(error)} />
  );
}
