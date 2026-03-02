import { SIGN_UP_AUTH_PAGE } from "@/features/auth";
import { AuthPageView } from "@/views/auth";
import { getOAuthErrorCode } from "@/views/auth/server";

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const { error } = await searchParams;

  return (
    <AuthPageView config={SIGN_UP_AUTH_PAGE} oauthErrorCode={getOAuthErrorCode(error)} />
  );
}
