import type { NextConfig } from "next";

function avatarRemotePattern() {
  const rawURL = process.env.NEXT_PUBLIC_AVATAR_PUBLIC_URL;
  if (!rawURL) {
    return null;
  }

  try {
    const url = new URL(rawURL);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
    };
  } catch {
    return null;
  }
}

const avatarPattern = avatarRemotePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      ...(avatarPattern ? [avatarPattern] : []),
    ],
  },
};

export default nextConfig;
