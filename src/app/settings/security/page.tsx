import { ArrowUpRight, MailCheck } from "lucide-react";
import { Button } from "@/shared/ui/Button";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-5">
      <section className="app-settings-section rounded-3xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="app-settings-tab-icon app-settings-tab-icon-active inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
            <MailCheck className="h-5 w-5" strokeWidth={2.1} />
          </span>

          <div>
            <h3 className="text-[1.2rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
              Password Recovery
            </h3>
            <p className="mt-2 max-w-130 text-[15px] leading-[1.65] tracking-[-0.02em] text-(--app-text-soft)">
              Need to rotate credentials? Start the recovery flow and we&apos;ll send a
              6-digit verification code to your account email.
            </p>

            <Button
              href="/recovery"
              className="mt-5 min-h-11.5 rounded-xl px-4 text-[14px]"
            >
              Open Recovery Flow
              <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={2.2} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
