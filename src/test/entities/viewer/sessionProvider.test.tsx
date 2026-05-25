import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ViewerSessionProvider, useViewerSession } from "@/entities/viewer";
import { HOME_HREF } from "@/shared/config/routes";
import { createViewerWithUsername } from "@/test/fixtures/viewer";

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerMocks.push,
    refresh: routerMocks.refresh,
  }),
}));

function ViewerSessionHarness() {
  const { viewer, isLoading, isSigningOut, setViewer, signOut } = useViewerSession();
  const [errorMessage, setErrorMessage] = useState("none");

  return (
    <div>
      <span data-testid="viewer">{viewer?.username ?? "none"}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
      <span data-testid="is-signing-out">{String(isSigningOut)}</span>
      <span data-testid="error-message">{errorMessage}</span>

      <button type="button" onClick={() => setViewer(createViewerWithUsername("manual"))}>
        set-viewer
      </button>
      <button type="button" onClick={() => setViewer(null)}>
        clear-viewer
      </button>
      <button
        type="button"
        onClick={() => {
          signOut().catch((error: unknown) => {
            if (error instanceof Error) {
              setErrorMessage(error.message);
              return;
            }
            setErrorMessage("Unknown sign-out error");
          });
        }}
      >
        sign-out
      </button>
    </div>
  );
}

function HookOutsideProvider() {
  useViewerSession();
  return null;
}

describe("ViewerSessionProvider", () => {
  beforeEach(() => {
    routerMocks.push.mockReset();
    routerMocks.refresh.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("throws when useViewerSession is used outside provider", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<HookOutsideProvider />)).toThrow(
      "useViewerSession must be used within ViewerSessionProvider",
    );

    consoleErrorSpy.mockRestore();
  });

  it("exposes initial viewer and default loading state", () => {
    render(
      <ViewerSessionProvider initialViewer={createViewerWithUsername("alice")}>
        <ViewerSessionHarness />
      </ViewerSessionProvider>,
    );

    expect(screen.getByTestId("viewer")).toHaveTextContent("alice");
    expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    expect(screen.getByTestId("is-signing-out")).toHaveTextContent("false");
  });

  it("updates viewer state via context setViewer", () => {
    render(
      <ViewerSessionProvider initialViewer={createViewerWithUsername("alice")}>
        <ViewerSessionHarness />
      </ViewerSessionProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set-viewer" }));
    expect(screen.getByTestId("viewer")).toHaveTextContent("manual");

    fireEvent.click(screen.getByRole("button", { name: "clear-viewer" }));
    expect(screen.getByTestId("viewer")).toHaveTextContent("none");
  });

  it("syncs viewer when initialViewer prop changes", () => {
    const { rerender } = render(
      <ViewerSessionProvider initialViewer={createViewerWithUsername("alice")}>
        <ViewerSessionHarness />
      </ViewerSessionProvider>,
    );

    expect(screen.getByTestId("viewer")).toHaveTextContent("alice");

    rerender(
      <ViewerSessionProvider initialViewer={createViewerWithUsername("bob")}>
        <ViewerSessionHarness />
      </ViewerSessionProvider>,
    );

    expect(screen.getByTestId("viewer")).toHaveTextContent("bob");
  });

  it("signs out successfully, clears viewer and navigates home", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ViewerSessionProvider initialViewer={createViewerWithUsername("alice")}>
        <ViewerSessionHarness />
      </ViewerSessionProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "sign-out" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/sign-out"), {
        method: "POST",
        credentials: "include",
      });
    });

    await waitFor(() => {
      expect(routerMocks.push).toHaveBeenCalledWith(HOME_HREF);
      expect(routerMocks.refresh).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("viewer")).toHaveTextContent("none");
      expect(screen.getByTestId("is-signing-out")).toHaveTextContent("false");
    });
  });

  it("prevents duplicate sign-out requests while one is already running", async () => {
    let resolveFetch: (response: Response) => void = () => {
      throw new Error("Expected delayed fetch resolver to be initialized");
    };
    const delayedResponse = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(delayedResponse);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ViewerSessionProvider initialViewer={createViewerWithUsername("alice")}>
        <ViewerSessionHarness />
      </ViewerSessionProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "sign-out" }));
    fireEvent.click(screen.getByRole("button", { name: "sign-out" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("is-signing-out")).toHaveTextContent("true");

    resolveFetch(new Response(null, { status: 200 }));

    await waitFor(() => {
      expect(screen.getByTestId("is-signing-out")).toHaveTextContent("false");
    });
  });

  it("keeps viewer and exposes error when sign-out fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ViewerSessionProvider initialViewer={createViewerWithUsername("alice")}>
        <ViewerSessionHarness />
      </ViewerSessionProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "sign-out" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent("Failed to sign out");
      expect(screen.getByTestId("viewer")).toHaveTextContent("alice");
      expect(routerMocks.push).not.toHaveBeenCalled();
      expect(routerMocks.refresh).not.toHaveBeenCalled();
      expect(screen.getByTestId("is-signing-out")).toHaveTextContent("false");
    });
  });
});
