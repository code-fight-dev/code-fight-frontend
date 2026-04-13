import type { AvatarSource } from "./types";

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_AVATAR_FILE_SIZE = 2_000_000;

export function getProfileInitial(username: string) {
  const normalized = username.trim().replace(/^@+/, "");
  const fallback = normalized.charAt(0).toUpperCase();

  return fallback || "#";
}

export function getAvatarAlt(username: string) {
  return `${username} avatar`;
}

export function shouldBypassAvatarOptimization(avatarUrl: string) {
  return avatarUrl.startsWith("data:");
}

export function shouldShowGeneratedAvatar(avatarUrl: string, avatarSource: AvatarSource) {
  return avatarUrl === "" || avatarSource === "none";
}

export function validateAvatarFile(file: File) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return "Avatar must be jpg, jpeg, png, or gif.";
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    return "Avatar file must be 2 MB or smaller.";
  }

  return null;
}

export function readAvatarFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read avatar file"));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read avatar file"));
    };

    reader.readAsDataURL(file);
  });
}
