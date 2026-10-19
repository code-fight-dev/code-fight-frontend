import { isAccountRole } from "@/entities/viewer";
import type { AccountRole } from "@/entities/viewer";
import { isRecord, managementRequest } from "@/shared/api/management";

export type ManagedUser = {
  id: string;
  username: string;
  role: AccountRole;
  roleVersion: number;
};

function readUser(body: unknown): ManagedUser {
  if (!isRecord(body) || !isRecord(body.user))
    throw new Error("Invalid account response");
  const user = body.user;
  if (
    typeof user.id !== "string" ||
    typeof user.username !== "string" ||
    !isAccountRole(user.role) ||
    typeof user.roleVersion !== "number" ||
    !Number.isSafeInteger(user.roleVersion) ||
    user.roleVersion < 1
  )
    throw new Error("Invalid account response");
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    roleVersion: user.roleVersion,
  };
}

export async function getManagedUser(id: string) {
  return readUser(await managementRequest(`/admin/users/${encodeURIComponent(id)}`));
}

export async function changeAccountRole(
  user: ManagedUser,
  role: "user" | "organizer",
  reason: string,
) {
  return readUser(
    await managementRequest(`/admin/users/${encodeURIComponent(user.id)}/role`, {
      method: "PATCH",
      body: { role, expectedRoleVersion: user.roleVersion, reason },
    }),
  );
}
