import { redirect } from "next/navigation";
import { SETTINGS_PROFILE_HREF } from "@/shared/config/routes";

export default function SettingsPage() {
  redirect(SETTINGS_PROFILE_HREF);
}
