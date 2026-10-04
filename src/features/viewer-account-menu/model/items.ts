import { canOrganizeTournaments } from "@/entities/viewer";
import type { AccountRole } from "@/entities/viewer";

export function getManagementLinks(role: AccountRole) {
  const links: { href: string; label: string }[] = [];
  if (canOrganizeTournaments(role))
    links.push({ href: "/organizer/tournaments", label: "Manage tournaments" });
  if (role === "admin") links.push({ href: "/admin/users", label: "Account roles" });
  return links;
}

export type ViewerAccountMenuItem = {
  id: "my-profile" | "settings" | "sign-out";
  label: string;
  disabled?: boolean;
};

export const VIEWER_ACCOUNT_MENU_ITEMS: ViewerAccountMenuItem[] = [
  {
    id: "my-profile",
    label: "My Profile",
  },
  {
    id: "settings",
    label: "Settings",
  },
  {
    id: "sign-out",
    label: "Sign out",
  },
];
