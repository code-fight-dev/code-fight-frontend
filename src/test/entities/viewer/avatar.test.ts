import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAvatarAlt,
  getProfileInitial,
  readAvatarFile,
  shouldBypassAvatarOptimization,
  shouldShowGeneratedAvatar,
  validateAvatarFile,
} from "@/entities/viewer";

describe("getProfileInitial", () => {
  it("returns uppercase first character from username", () => {
    expect(getProfileInitial("lyosha")).toBe("L");
    expect(getProfileInitial("Oleksiy")).toBe("O");
  });

  it("trims username before creating initial", () => {
    expect(getProfileInitial("  lyosha  ")).toBe("L");
  });

  it("removes leading @ characters before creating initial", () => {
    expect(getProfileInitial("@lyosha")).toBe("L");
    expect(getProfileInitial("@@oleksiy")).toBe("O");
  });

  it("returns fallback initial when username has no usable characters", () => {
    expect(getProfileInitial("")).toBe("#");
    expect(getProfileInitial("   ")).toBe("#");
    expect(getProfileInitial("@@@")).toBe("#");
  });
});

describe("getAvatarAlt", () => {
  it("builds avatar alt text from username", () => {
    expect(getAvatarAlt("lyosha")).toBe("lyosha avatar");
    expect(getAvatarAlt("@oleksiy")).toBe("@oleksiy avatar");
  });
});

describe("shouldBypassAvatarOptimization", () => {
  it("returns true for data URLs", () => {
    expect(shouldBypassAvatarOptimization("data:image/png;base64,avatar")).toBe(true);
  });

  it("returns false for regular URLs", () => {
    expect(shouldBypassAvatarOptimization("https://example.com/avatar.png")).toBe(false);
    expect(shouldBypassAvatarOptimization("/avatars/user.png")).toBe(false);
  });
});

describe("shouldShowGeneratedAvatar", () => {
  it("returns true when avatar URL is empty", () => {
    expect(shouldShowGeneratedAvatar("", "uploaded" as never)).toBe(true);
  });

  it("returns true when avatar source is none", () => {
    expect(shouldShowGeneratedAvatar("https://example.com/avatar.png", "none")).toBe(
      true,
    );
  });

  it("returns false when avatar URL is present and source is not none", () => {
    expect(
      shouldShowGeneratedAvatar("https://example.com/avatar.png", "uploaded" as never),
    ).toBe(false);
  });
});

describe("validateAvatarFile", () => {
  it("accepts jpeg avatars", () => {
    const file = new File(["avatar"], "avatar.jpg", {
      type: "image/jpeg",
    });

    expect(validateAvatarFile(file)).toBeNull();
  });

  it("accepts png avatars", () => {
    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    expect(validateAvatarFile(file)).toBeNull();
  });

  it("accepts gif avatars", () => {
    const file = new File(["avatar"], "avatar.gif", {
      type: "image/gif",
    });

    expect(validateAvatarFile(file)).toBeNull();
  });

  it("rejects unsupported avatar file types", () => {
    const file = new File(["avatar"], "avatar.webp", {
      type: "image/webp",
    });

    expect(validateAvatarFile(file)).toBe("Avatar must be jpg, jpeg, png, or gif.");
  });

  it("rejects avatar files larger than 2 MB", () => {
    const file = new File([new Uint8Array(2_000_001)], "avatar.png", {
      type: "image/png",
    });

    expect(validateAvatarFile(file)).toBe("Avatar file must be 2 MB or smaller.");
  });

  it("checks file type before file size", () => {
    const file = new File([new Uint8Array(2_000_001)], "avatar.webp", {
      type: "image/webp",
    });

    expect(validateAvatarFile(file)).toBe("Avatar must be jpg, jpeg, png, or gif.");
  });
});

describe("readAvatarFile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves with data URL when file is read successfully", async () => {
    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    await expect(readAvatarFile(file)).resolves.toMatch(/^data:image\/png;base64,/);
  });

  it("rejects when FileReader result is not a string", async () => {
    class NonStringFileReader {
      result: string | ArrayBuffer | null = new ArrayBuffer(0);
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL() {
        this.onload?.();
      }
    }

    vi.stubGlobal("FileReader", NonStringFileReader);

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    await expect(readAvatarFile(file)).rejects.toThrow("Failed to read avatar file");
  });

  it("rejects when FileReader fails", async () => {
    class FailedFileReader {
      result: string | ArrayBuffer | null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL() {
        this.onerror?.();
      }
    }

    vi.stubGlobal("FileReader", FailedFileReader);

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    await expect(readAvatarFile(file)).rejects.toThrow("Failed to read avatar file");
  });
});
