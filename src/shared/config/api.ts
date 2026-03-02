const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL?.replace(/\/$/, "");

export const API_BASE_URL =
  typeof window === "undefined"
    ? internalApiBaseUrl || publicApiBaseUrl || "http://localhost:8080"
    : publicApiBaseUrl || "http://localhost:8080";
