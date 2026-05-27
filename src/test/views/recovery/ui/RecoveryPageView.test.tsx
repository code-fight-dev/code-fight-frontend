import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecoveryPageView } from "@/views/recovery/ui/RecoveryPageView";

const recoveryFeatureMocks = vi.hoisted(() => ({
  PasswordRecoveryFlow: vi.fn(() => (
    <div data-testid="password-recovery-flow">password-recovery-flow</div>
  )),
}));

vi.mock("@/features/password-recovery", () => ({
  PasswordRecoveryFlow: recoveryFeatureMocks.PasswordRecoveryFlow,
}));

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe("views/recovery/ui/RecoveryPageView", () => {
  it("renders recovery layout with password recovery flow", () => {
    render(<RecoveryPageView />);

    expect(recoveryFeatureMocks.PasswordRecoveryFlow).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("password-recovery-flow")).toHaveTextContent(
      "password-recovery-flow",
    );
  });
});
