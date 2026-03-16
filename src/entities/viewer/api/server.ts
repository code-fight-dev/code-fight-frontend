import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { API_BASE_URL } from "@/shared/config/api";
import { isViewer } from "../model/types";

type AuthResponse = {
  user?: unknown;
};

export const getCurrentViewerServer = cache(async function getCurrentViewerServer() {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }

    const body = (await response.json().catch(() => null)) as AuthResponse | null;

    if (!body || !isViewer(body.user)) {
      throw new Error("Invalid current user response");
    }

    return body.user;
  } catch {
    return null;
  }
});
