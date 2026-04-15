import { Toast } from "@/shared/ui/Toast";

type Props = {
  message: string | null;
};

export function ProfileSettingsToast({ message }: Props) {
  return <Toast message={message} />;
}
