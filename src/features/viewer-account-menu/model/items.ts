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
