import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useViewerSession } from "@/entities/viewer";
import { AccountRolesPanel } from "@/features/account-roles";
import { TournamentManagementPanel } from "@/features/tournament-management";
import { REQUEST_TIMEOUT_MS } from "@/shared/api/requestDeadline";
import { createTournamentDraftFixture } from "@/test/fixtures/tournament";
import { createViewerFixture } from "@/test/fixtures/viewer";
import { createDeferred } from "@/test/helpers/deferred";
import { ManagementSession } from "@/test/helpers/managementSession";

const router = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function ViewerState() {
  const { viewer } = useViewerSession();
  return <span data-testid="viewer-role">{viewer?.role ?? "signed-out"}</span>;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("unsaved tournament edits", () => {
  it("confirms before switching drafts or starting a new draft", async () => {
    const user = userEvent.setup();
    const first = createTournamentDraftFixture();
    const second = createTournamentDraftFixture({ id: "second", title: "Second cup" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ items: [first, second] })),
    );
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<TournamentManagementPanel />, { wrapper: ManagementSession });
    await user.click(await screen.findByRole("button", { name: /Autumn Cup/ }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Unsaved title");
    await user.click(screen.getByRole("button", { name: /Second cup/ }));
    expect(screen.getByLabelText("Title")).toHaveValue("Unsaved title");
    await user.click(screen.getByRole("button", { name: "New draft" }));
    expect(screen.getByLabelText("Title")).toHaveValue("Unsaved title");
    expect(confirm).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("button", { name: /Autumn Cup/ }));
    expect(confirm).toHaveBeenCalledTimes(2);
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: /Second cup/ }));
    expect(screen.getByLabelText("Title")).toHaveValue(second.title);
    await user.click(screen.getByRole("button", { name: /Autumn Cup/ }));
    expect(screen.getByLabelText("Title")).toHaveValue(first.title);
    expect(confirm).toHaveBeenCalledTimes(3);
  });

  it("protects an unsaved new draft and treats reverted edits as clean", async () => {
    const user = userEvent.setup();
    const draft = createTournamentDraftFixture();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ items: [draft] })));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<TournamentManagementPanel />, { wrapper: ManagementSession });
    await screen.findByRole("button", { name: /Autumn Cup/ });
    await user.type(screen.getByLabelText("Title"), "New local title");
    await user.click(screen.getByRole("button", { name: /Autumn Cup/ }));
    expect(screen.getByLabelText("Title")).toHaveValue("New local title");
    await user.clear(screen.getByLabelText("Title"));
    await user.click(screen.getByRole("button", { name: /Autumn Cup/ }));
    expect(screen.getByLabelText("Title")).toHaveValue(draft.title);
    expect(confirm).toHaveBeenCalledOnce();
  });
});

describe("lost management access", () => {
  it.each([401, 403])(
    "clears the selection when pagination returns %s",
    async (status) => {
      const user = userEvent.setup();
      const draft = createTournamentDraftFixture();
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValueOnce(response({ items: [draft], nextCursor: "next" }))
          .mockResolvedValueOnce(
            response({ error: { message: "Pagination access lost" } }, status),
          )
          .mockResolvedValueOnce(response({}, 401)),
      );
      render(<TournamentManagementPanel />, { wrapper: ManagementSession });
      await user.click(await screen.findByRole("button", { name: /Autumn Cup/ }));
      await user.click(screen.getByRole("button", { name: "Load more" }));
      await screen.findByText("Pagination access lost");
      expect(
        screen.getByRole("list", { name: "Tournament drafts" }),
      ).toBeEmptyDOMElement();
      expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Refresh list" })).toBeDisabled();
    },
  );

  it.each([401, 403])(
    "clears protected drafts on a refresh returning %s and updates the session",
    async (status) => {
      const user = userEvent.setup();
      const draft = createTournamentDraftFixture();
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ items: [draft], nextCursor: "next" }))
        .mockResolvedValueOnce(
          response(
            {
              error: {
                code: status === 401 ? "unauthenticated" : "forbidden",
                message: "Access is gone",
              },
            },
            status,
          ),
        )
        .mockResolvedValueOnce(
          status === 401 ? response({}, 401) : response({ user: createViewerFixture() }),
        );
      vi.stubGlobal("fetch", fetchMock);
      render(
        <>
          <TournamentManagementPanel />
          <ViewerState />
        </>,
        { wrapper: ManagementSession },
      );
      await user.click(await screen.findByRole("button", { name: /Autumn Cup/ }));
      await user.click(screen.getByRole("button", { name: "Refresh list" }));
      await screen.findByText("Access is gone");
      expect(
        screen.getByRole("list", { name: "Tournament drafts" }),
      ).toBeEmptyDOMElement();
      expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Save changes" }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Refresh list" })).toBeDisabled();
      expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
      await waitFor(() =>
        expect(screen.getByTestId("viewer-role")).toHaveTextContent(
          status === 401 ? "signed-out" : "user",
        ),
      );
      expect(fetchMock.mock.calls[2][0]).toContain("/auth/me");
      expect(router.refresh).toHaveBeenCalledOnce();
      expect(
        screen.getByRole("link", { name: status === 401 ? "Sign in" : "Go home" }),
      ).toBeInTheDocument();
    },
  );

  it.each([401, 403])(
    "also clears protected data when saving returns %s",
    async (status) => {
      const user = userEvent.setup();
      const draft = createTournamentDraftFixture();
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValueOnce(response({ items: [draft] }))
          .mockResolvedValueOnce(
            response(
              {
                error: {
                  message: "Access is gone",
                  code: status === 401 ? "unauthenticated" : "forbidden",
                },
              },
              status,
            ),
          )
          .mockResolvedValueOnce(response({}, 401)),
      );
      render(<TournamentManagementPanel />, { wrapper: ManagementSession });
      await user.click(await screen.findByRole("button", { name: /Autumn Cup/ }));
      await user.click(screen.getByRole("button", { name: "Save changes" }));
      await screen.findByText("Access is gone");
      expect(
        screen.getByRole("list", { name: "Tournament drafts" }),
      ).toBeEmptyDOMElement();
      expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Refresh list" })).toBeDisabled();
    },
  );

  it("preserves edits and ordinary refresh recovery after a server error", async () => {
    const user = userEvent.setup();
    const draft = createTournamentDraftFixture();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ items: [draft] }))
      .mockResolvedValueOnce(
        response({ error: { message: "Temporarily unavailable" } }, 503),
      )
      .mockResolvedValueOnce(response({ items: [draft] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<TournamentManagementPanel />, { wrapper: ManagementSession });
    await user.click(await screen.findByRole("button", { name: /Autumn Cup/ }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Local title");
    await user.click(screen.getByRole("button", { name: "Refresh list" }));
    await screen.findByText("Temporarily unavailable");
    expect(screen.getByLabelText("Title")).toHaveValue("Local title");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Refresh list" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByLabelText("Title")).toHaveValue("Local title");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(router.refresh).not.toHaveBeenCalled();
  });
});

describe("stalled requests and uncertain saves", () => {
  it("allows retrying creation only after checking that the submitted slug is absent", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ items: [] }))
      .mockReturnValueOnce(new Promise(() => {}))
      .mockResolvedValueOnce(response({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<TournamentManagementPanel />, { wrapper: ManagementSession });
    await screen.findByText("No drafts yet. Create your first tournament.");
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Local new cup" },
    });
    fireEvent.change(screen.getByLabelText("Slug"), {
      target: { value: "local-new-cup" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create draft" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    });
    expect(screen.getByRole("button", { name: "Create draft" })).toBeDisabled();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Check save status" }));
    });
    expect(
      screen.getByText(/No draft with the submitted slug was found/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create draft" })).toBeEnabled();
    expect(screen.getByLabelText("Title")).toHaveValue("Local new cup");
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: "GET" });
  });

  it("bounds a stalled list request and enables a fresh list retry", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(new Promise(() => {}))
      .mockResolvedValueOnce(response({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<TournamentManagementPanel />, { wrapper: ManagementSession });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("timed out");
    expect(screen.getByRole("button", { name: "Refresh list" })).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Refresh list" }));
    });
    expect(
      screen.getByText("No drafts yet. Create your first tournament."),
    ).toBeInTheDocument();
  });

  it("releases navigation after a save timeout and reconciles before retrying", async () => {
    const user = userEvent.setup();
    const draft = createTournamentDraftFixture({ configVersion: 7 });
    const pending = createDeferred<Response>();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ items: [draft] }))
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(
        response({ tournament: { ...draft, title: "Server title", configVersion: 8 } }),
      )
      .mockResolvedValueOnce(
        response({ tournament: { ...draft, title: "Local title", configVersion: 9 } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<TournamentManagementPanel />, { wrapper: ManagementSession });
    await user.click(await screen.findByRole("button", { name: /Autumn Cup/ }));
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Local title" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    });
    expect((fetchMock.mock.calls[1][1] as RequestInit).signal?.aborted).toBe(true);
    expect(screen.getByRole("alert")).toHaveTextContent("Check save status");
    expect(screen.getByLabelText("Title")).toHaveValue("Local title");
    expect(screen.getByRole("button", { name: "Refresh list" })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Autumn Cup/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reload draft" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "New draft" }));
    fireEvent.click(screen.getByRole("button", { name: /Autumn Cup/ }));
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(screen.getByLabelText("Title")).toHaveValue("Local title");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Check save status" }));
    });
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: "GET" });
    expect(screen.getByLabelText("Title")).toHaveValue("Local title");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    });
    expect(
      JSON.parse(String((fetchMock.mock.calls[3][1] as RequestInit).body)),
    ).toMatchObject({ title: "Local title", expectedConfigVersion: 8 });
    await act(async () => {
      pending.resolve(
        response({
          tournament: { ...draft, title: "Late stale title", configVersion: 99 },
        }),
      );
    });
    expect(screen.getByLabelText("Title")).toHaveValue("Local title");
    expect(
      screen.queryByRole("button", { name: /Late stale title/ }),
    ).not.toBeInTheDocument();
  });

  it("finds a possibly-created draft across pages and preserves subsequent edits", async () => {
    const draft = createTournamentDraftFixture();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ items: [] }))
      .mockReturnValueOnce(new Promise(() => {}))
      .mockResolvedValueOnce(response({ items: [], nextCursor: "second-page" }))
      .mockResolvedValueOnce(response({ items: [draft] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<TournamentManagementPanel />, { wrapper: ManagementSession });
    await screen.findByText("No drafts yet. Create your first tournament.");
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: draft.title } });
    fireEvent.change(screen.getByLabelText("Slug"), { target: { value: draft.slug } });
    fireEvent.click(screen.getByRole("button", { name: "Create draft" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    });
    expect(screen.getByRole("button", { name: "Create draft" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Later local title" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Check save status" }));
    });
    expect(fetchMock.mock.calls[3][0]).toContain("cursor=second-page");
    expect(
      fetchMock.mock.calls.filter(
        ([, options]) => (options as RequestInit).method === "POST",
      ),
    ).toHaveLength(1);
    expect(screen.getByLabelText("Title")).toHaveValue("Later local title");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("requires a fresh account lookup after a role mutation loses its response", async () => {
    const user = userEvent.setup();
    const account = {
      id: "account",
      username: "organizer",
      role: "organizer",
      roleVersion: 2,
    };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(response({ user: account }))
        .mockReturnValueOnce(new Promise(() => {})),
    );
    render(<AccountRolesPanel />, { wrapper: ManagementSession });
    await user.type(screen.getByLabelText("Account ID"), account.id);
    await user.click(screen.getByRole("button", { name: "Load account" }));
    await screen.findByText("Current role: organizer");
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "Access ended" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revoke organizer role" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Load the account again before retrying",
    );
    expect(
      screen.queryByRole("button", { name: "Revoke organizer role" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load account" })).toBeEnabled();
  });
});
