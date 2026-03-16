import { redirect } from "next/navigation";
import { SETTINGS_APPEARANCE_HREF } from "@/shared/config/routes";

export default function SettingsPage() {
  redirect(SETTINGS_APPEARANCE_HREF);
}
