import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isViewer } from "@/entities/viewer";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { AccountRolesPanel } from "@/features/account-roles";
import { TournamentManagementPanel } from "@/features/tournament-management";
import { getManagementLinks } from "@/features/viewer-account-menu/model/items";
import AdminUsersPage from "@/app/admin/users/page";
import OrganizerTournamentsPage from "@/app/organizer/tournaments/page";
import { createViewerFixture } from "@/test/fixtures/viewer";
import { createTournamentDraftFixture } from "@/test/fixtures/tournament";

vi.mock("@/entities/viewer/server", () => ({ getCurrentViewerServer: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
  notFound: () => {
    throw new Error("not-found");
  },
}));

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("foundation roles and management", () => {
  it("accepts only explicit known roles and positive role versions", () => {
    const viewer = createViewerFixture();
    expect(isViewer(viewer)).toBe(true);
    expect(isViewer({ ...viewer, role: "root" })).toBe(false);
    expect(isViewer({ ...viewer, role: undefined })).toBe(false);
    expect(isViewer({ ...viewer, roleVersion: 0 })).toBe(false);
    expect(getManagementLinks("user")).toEqual([]);
    expect(getManagementLinks("organizer").map((item) => item.href)).toEqual([
      "/organizer/tournaments",
    ]);
    expect(getManagementLinks("admin").map((item) => item.href)).toEqual([
      "/organizer/tournaments",
      "/admin/users",
    ]);
  });

  it("guards management pages using the current server session", async () => {
    vi.mocked(getCurrentViewerServer).mockResolvedValue(null);
    await expect(OrganizerTournamentsPage()).rejects.toThrow("redirect:/signin");
    await expect(AdminUsersPage()).rejects.toThrow("redirect:/signin");
    vi.mocked(getCurrentViewerServer).mockResolvedValue(createViewerFixture());
    await expect(OrganizerTournamentsPage()).rejects.toThrow("not-found");
    await expect(AdminUsersPage()).rejects.toThrow("not-found");
    vi.mocked(getCurrentViewerServer).mockResolvedValue(
      createViewerFixture("organizer", { role: "organizer" }),
    );
    await expect(OrganizerTournamentsPage()).resolves.toBeTruthy();
    await expect(AdminUsersPage()).rejects.toThrow("not-found");
    vi.mocked(getCurrentViewerServer).mockResolvedValue(
      createViewerFixture("admin", { role: "admin" }),
    );
    await expect(AdminUsersPage()).resolves.toBeTruthy();
    await expect(OrganizerTournamentsPage()).resolves.toBeTruthy();
  });

  it("loads an account and revokes the exact displayed role version with a reason", async () => {
    const user = userEvent.setup();
    const account = {
      id: "4be99232-e69b-44e0-a3f0-5d7c805c129d",
      username: "organizer",
      role: "organizer",
      roleVersion: 7,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ user: account }))
      .mockResolvedValueOnce(
        response({ user: { ...account, role: "user", roleVersion: 8 } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<AccountRolesPanel />);
    await user.type(screen.getByLabelText("Account ID"), account.id);
    await user.click(screen.getByRole("button", { name: "Load account" }));
    await screen.findByText("Current role: organizer");
    expect(screen.getByRole("button", { name: "Revoke organizer role" })).toBeDisabled();
    await user.type(screen.getByLabelText("Reason"), "Organizer access ended");
    await user.click(screen.getByRole("button", { name: "Revoke organizer role" }));
    await screen.findByText("Role updated: organizer is now user.");
    const [url, request] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toContain(`/api/admin/users/${account.id}/role`);
    expect(request.credentials).toBe("include");
    expect(JSON.parse(String(request.body))).toEqual({
      role: "user",
      expectedRoleVersion: 7,
      reason: "Organizer access ended",
    });
    expect(screen.getByRole("button", { name: "Grant organizer role" })).toBeDisabled();
  });

  it("cannot offer an admin role change and handles permission errors", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          user: { id: "admin-id", username: "admin", role: "admin", roleVersion: 2 },
        }),
      )
      .mockResolvedValueOnce(
        response(
          { error: { message: "Permission was revoked", code: "forbidden" } },
          403,
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<AccountRolesPanel />);
    await user.type(screen.getByLabelText("Account ID"), "admin-id");
    await user.click(screen.getByRole("button", { name: "Load account" }));
    await screen.findByText("Administrator roles cannot be changed here.");
    expect(screen.queryByLabelText("Reason")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Load account" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Permission was revoked");
    expect(screen.queryByText("Current role: admin")).not.toBeInTheDocument();
  });

  it("creates a draft, preserves conflicting edits and saves the reloaded version", async () => {
    const user = userEvent.setup();
    const draft = createTournamentDraftFixture();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ items: [] }))
      .mockResolvedValueOnce(response({ tournament: draft }, 201))
      .mockResolvedValueOnce(
        response(
          { error: { code: "version_conflict", message: "Reload before saving" } },
          409,
        ),
      )
      .mockResolvedValueOnce(
        response({ tournament: { ...draft, title: "Server title", configVersion: 4 } }),
      )
      .mockResolvedValueOnce(
        response({ tournament: { ...draft, title: "Final title", configVersion: 5 } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<TournamentManagementPanel />);
    await screen.findByText("No drafts yet. Create your first tournament.");
    await user.type(screen.getByLabelText("Title"), draft.title);
    await user.type(screen.getByLabelText("Slug"), draft.slug);
    await user.click(screen.getByRole("button", { name: "Create draft" }));
    await screen.findByRole("button", { name: /Autumn Cup/ });
    const createRequest = fetchMock.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(String(createRequest.body))).toEqual({
      title: draft.title,
      slug: draft.slug,
      description: "",
    });
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Unsaved title");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Reload before saving");
    expect(screen.getByRole("alert")).toHaveTextContent("Reload draft to replace them");
    expect(screen.getByLabelText("Title")).toHaveValue("Unsaved title");
    expect(
      JSON.parse(String((fetchMock.mock.calls[2][1] as RequestInit).body)),
    ).toMatchObject({ expectedConfigVersion: 1 });
    await user.click(screen.getByRole("button", { name: "Reload draft" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Title")).toHaveValue("Server title"),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Final title");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByRole("button", { name: /Final title/ });
    expect(
      JSON.parse(String((fetchMock.mock.calls[4][1] as RequestInit).body)),
    ).toMatchObject({ expectedConfigVersion: 4, title: "Final title" });
    expect(screen.getByRole("button", { name: "New draft" })).toBeEnabled();
  });

  it("keeps a duplicate slug error separate from version conflicts when editing", async () => {
    const user = userEvent.setup();
    const taken = createTournamentDraftFixture();
    const draft = createTournamentDraftFixture({
      id: "draft-b",
      title: "Spring Cup",
      slug: "spring-cup",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ items: [taken, draft] }))
      .mockResolvedValueOnce(
        response(
          {
            error: {
              code: "slug_taken",
              message: "This tournament slug is already in use",
              requestId: "slug-request",
            },
          },
          409,
        ),
      )
      .mockResolvedValueOnce(
        response({ tournament: { ...draft, slug: "autumn-cup-b", configVersion: 2 } }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<TournamentManagementPanel />);
    await user.click(await screen.findByRole("button", { name: /Spring Cup/ }));
    await user.clear(screen.getByLabelText("Slug"));
    await user.type(screen.getByLabelText("Slug"), taken.slug);
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This tournament slug is already in use",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "Reload draft to replace them",
    );
    expect(screen.getByLabelText("Slug")).toHaveValue(taken.slug);
    expect(screen.getByLabelText("Title")).toHaveValue(draft.title);
    await user.clear(screen.getByLabelText("Slug"));
    await user.type(screen.getByLabelText("Slug"), "autumn-cup-b");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText("Draft saved.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: "PATCH" });
    expect(
      JSON.parse(String((fetchMock.mock.calls[2][1] as RequestInit).body)),
    ).toMatchObject({ slug: "autumn-cup-b", expectedConfigVersion: 1 });
  });

  it("surfaces rejected organizer access without rendering foreign drafts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ error: "forbidden" }, 403)),
    );
    render(<TournamentManagementPanel />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("forbidden"));
    expect(screen.getByRole("list", { name: "Tournament drafts" })).toBeEmptyDOMElement();
  });
});
