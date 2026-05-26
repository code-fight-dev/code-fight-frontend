import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChallengeWorkspaceActionButton } from "@/views/challenges/ui/ChallengeWorkspaceActionButton";
import { ChallengeWorkspaceResizeHandle } from "@/views/challenges/ui/ChallengeWorkspaceResizeHandle";
import { ChallengeWorkspaceTabs } from "@/views/challenges/ui/ChallengeWorkspaceTabs";
import { OutputPanel } from "@/views/challenges/ui/OutputPanel";
import { TestcasePanel } from "@/views/challenges/ui/TestcasePanel";

describe("views/challenges/ui workspace parts", () => {
  it("renders action buttons for run and submit modes", () => {
    const onRun = vi.fn();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <ChallengeWorkspaceActionButton action="run" disabled={false} onClick={onRun} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Run Code" }));
    expect(onRun).toHaveBeenCalledTimes(1);

    rerender(
      <ChallengeWorkspaceActionButton action="submit" disabled onClick={onSubmit} />,
    );
    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();
  });

  it("renders workspace tabs and notifies tab changes", () => {
    const onTabChange = vi.fn();

    render(<ChallengeWorkspaceTabs activeTab="testcases" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Console" }));
    expect(onTabChange).toHaveBeenCalledWith("console");
  });

  it("renders resize handle and forwards pointer down event", () => {
    const onResizeStart = vi.fn();
    render(<ChallengeWorkspaceResizeHandle onResizeStart={onResizeStart} />);

    fireEvent.pointerDown(
      screen.getByRole("button", { name: "Resize problem and editor panels" }),
    );
    expect(onResizeStart).toHaveBeenCalledTimes(1);
  });

  it("renders output panel variants for idle/running/error/submitted states", () => {
    const { rerender } = render(<OutputPanel status="idle" message="Ready" />);

    expect(screen.getByText("Awaiting execution")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();

    rerender(<OutputPanel status="running" message="Running..." />);
    expect(screen.getByText("Awaiting execution")).toBeInTheDocument();

    rerender(<OutputPanel status="error" message="Compilation failed" />);
    expect(screen.getByText("Execution failed")).toBeInTheDocument();
    expect(screen.getByText("Compilation failed")).toBeInTheDocument();

    rerender(<OutputPanel status="submitted" message="Accepted" />);
    expect(screen.getByText("Awaiting execution")).toBeInTheDocument();
    expect(screen.getByText("Accepted")).toBeInTheDocument();
  });

  it("renders testcase panel with active testcase and custom input", () => {
    const onActiveIndexChange = vi.fn();
    const onCustomInputChange = vi.fn();
    const { rerender } = render(
      <TestcasePanel
        testCases={[
          { name: "Case 1", input: "1", expectedOutput: "2" },
          { name: "Case 2", input: "3", expectedOutput: "4" },
        ]}
        activeIndex={1}
        customInput="42"
        onActiveIndexChange={onActiveIndexChange}
        onCustomInputChange={onCustomInputChange}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Case 1" }));
    expect(onActiveIndexChange).toHaveBeenCalledWith(0);

    fireEvent.change(screen.getByPlaceholderText("Paste custom input for a future run"), {
      target: { value: "100" },
    });
    expect(onCustomInputChange).toHaveBeenCalledWith("100");

    rerender(
      <TestcasePanel
        testCases={[]}
        activeIndex={0}
        customInput=""
        onActiveIndexChange={onActiveIndexChange}
        onCustomInputChange={onCustomInputChange}
      />,
    );

    expect(screen.queryByText("Expected output")).not.toBeInTheDocument();
  });
});
