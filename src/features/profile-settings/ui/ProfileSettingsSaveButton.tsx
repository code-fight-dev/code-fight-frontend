import { LoaderCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";

type Props = {
  disabled: boolean;
  isPending: boolean;
  onClick: () => void;
};

export function ProfileSettingsSaveButton({ disabled, isPending, onClick }: Props) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      aria-busy={isPending}
      className="min-h-10 min-w-30 rounded-xl px-4 text-[13px]"
    >
      <span className="inline-flex items-center justify-center gap-2">
        {isPending ? (
          <LoaderCircle
            className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
            strokeWidth={2}
          />
        ) : null}
        <span>{isPending ? "Saving" : "Save"}</span>
      </span>
    </Button>
  );
}
