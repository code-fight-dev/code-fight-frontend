import { SIGN_IN_AUTH_PAGE } from "@/features/auth";
import { AuthPageView } from "@/views/auth";
import { getOAuthErrorCode } from "@/views/auth/server";

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const { error } = await searchParams;

  return (
    <AuthPageView config={SIGN_IN_AUTH_PAGE} oauthErrorCode={getOAuthErrorCode(error)} />
  );
}
