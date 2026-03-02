export function getOAuthErrorCode(error: string | string[] | undefined): string | null {
  return typeof error === "string" ? error : (error?.[0] ?? null);
}
