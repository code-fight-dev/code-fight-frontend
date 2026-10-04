import { StrictMode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTournamentDraft,
  getTournamentDraft,
  listTournamentDrafts,
  updateTournamentDraft,
} from "@/entities/tournament";
import type { DraftPage, TournamentDraft } from "@/entities/tournament";
import { useTournamentDraftForm } from "@/features/tournament-management/model/useTournamentDraftForm";
import { useTournamentManagement } from "@/features/tournament-management/model/useTournamentManagement";
import { ManagementError } from "@/shared/api/management";
import { createTournamentDraftFixture } from "@/test/fixtures/tournament";
import { createDeferred } from "@/test/helpers/deferred";

vi.mock("@/entities/tournament", () => ({
  createTournamentDraft: vi.fn(),
  getTournamentDraft: vi.fn(),
  listTournamentDrafts: vi.fn(),
  updateTournamentDraft: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("tournament list model", () => {
  it("deduplicates paginated results and prevents concurrent page requests", async () => {
    const first = createTournamentDraftFixture();
    const second = createTournamentDraftFixture({ id: "second" });
    vi.mocked(listTournamentDrafts)
      .mockResolvedValueOnce({ items: [first], nextCursor: "next-page" })
      .mockResolvedValueOnce({ items: [first, second] });
    const { result } = renderHook(() => useTournamentManagement());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await Promise.all([result.current.loadMore(), result.current.loadMore()]);
    });
    expect(listTournamentDrafts).toHaveBeenCalledTimes(2);
    expect(listTournamentDrafts).toHaveBeenLastCalledWith(
      "next-page",
      expect.any(AbortSignal),
    );
    expect(result.current.drafts.map((item) => item.id)).toEqual([first.id, second.id]);
    expect(result.current.hasMore).toBe(false);
  });

  it("does not replace current data with a stale response under StrictMode", async () => {
    const stale = createDeferred<DraftPage>();
    const current = createTournamentDraftFixture({ id: "current" });
    vi.mocked(listTournamentDrafts)
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce({ items: [current] });
    const { result } = renderHook(() => useTournamentManagement(), {
      wrapper: StrictMode,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(vi.mocked(listTournamentDrafts).mock.calls[0][1]?.aborted).toBe(true);
    await act(async () => {
      stale.resolve({ items: [createTournamentDraftFixture({ id: "stale" })] });
    });
    expect(result.current.drafts).toEqual([current]);
  });

  it("aborts an active pagination request when unmounted", async () => {
    const pending = createDeferred<DraftPage>();
    vi.mocked(listTournamentDrafts)
      .mockResolvedValueOnce({ items: [], nextCursor: "next-page" })
      .mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(() => useTournamentManagement());
    await waitFor(() => expect(result.current.loading).toBe(false));
    let loading: Promise<void>;
    act(() => {
      loading = result.current.loadMore();
    });
    const signal = vi.mocked(listTournamentDrafts).mock.calls[1][1];
    unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      pending.resolve({ items: [] });
      await loading;
    });
  });

  it("locks selection, refresh and pagination while the editor is saving", async () => {
    const draft = createTournamentDraftFixture();
    vi.mocked(listTournamentDrafts).mockResolvedValue({
      items: [draft],
      nextCursor: "next-page",
    });
    const { result } = renderHook(() => useTournamentManagement());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.selectDraft(draft));
    act(() => {
      result.current.onBusyChange(true);
      result.current.selectDraft(null);
      result.current.refreshList();
    });
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.controlsDisabled).toBe(true);
    expect(result.current.selected).toEqual(draft);
    expect(listTournamentDrafts).toHaveBeenCalledTimes(1);
    act(() => result.current.onBusyChange(false));
    act(() => result.current.selectDraft(null));
    expect(result.current.selected).toBeNull();
  });
});

describe("tournament draft form model", () => {
  it("keeps edits on a version conflict and sends the displayed version", async () => {
    const draft = createTournamentDraftFixture({ configVersion: 7 });
    const onSaved = vi.fn();
    const onBusyChange = vi.fn();
    vi.mocked(updateTournamentDraft).mockRejectedValue(
      new ManagementError(
        "Reload before saving",
        409,
        "version_conflict",
        "version-request",
      ),
    );
    const { result } = renderHook(() =>
      useTournamentDraftForm({ draft, disabled: false, onSaved, onBusyChange }),
    );
    act(() => result.current.updateField("title", "Unsaved title"));
    await act(async () => {
      await result.current.save();
    });
    expect(updateTournamentDraft).toHaveBeenCalledWith(
      draft.id,
      {
        title: "Unsaved title",
        slug: draft.slug,
        description: draft.description,
      },
      7,
      expect.any(AbortSignal),
    );
    expect(result.current.values.title).toBe("Unsaved title");
    expect(result.current.conflict).toBe(true);
    expect(result.current.error).toBe("Reload before saving");
    expect(result.current.pending).toBeNull();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onBusyChange.mock.calls).toEqual([[true], [false]]);
  });

  it.each(["slug_taken", "other_conflict", undefined])(
    "does not treat a 409 with code %s as a version conflict",
    async (code) => {
      const draft = createTournamentDraftFixture();
      const onSaved = vi.fn();
      vi.mocked(updateTournamentDraft).mockRejectedValue(
        new ManagementError("Request rejected", 409, code),
      );
      const { result } = renderHook(() =>
        useTournamentDraftForm({
          draft,
          disabled: false,
          onSaved,
          onBusyChange: vi.fn(),
        }),
      );
      act(() => result.current.updateField("slug", "edited-slug"));
      await act(async () => {
        await result.current.save();
      });
      expect(result.current.conflict).toBe(false);
      expect(result.current.error).toBe("Request rejected");
      expect(result.current.values.slug).toBe("edited-slug");
      expect(result.current.busy).toBe(false);
      expect(onSaved).not.toHaveBeenCalled();
    },
  );

  it("reloads server fields even when the config version is unchanged", async () => {
    const draft = createTournamentDraftFixture();
    const onSaved = vi.fn();
    vi.mocked(getTournamentDraft).mockResolvedValue(draft);
    const { result } = renderHook(() =>
      useTournamentDraftForm({ draft, disabled: false, onSaved, onBusyChange: vi.fn() }),
    );
    act(() => result.current.updateField("title", "Discard this local edit"));
    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.values.title).toBe(draft.title);
    expect(onSaved).toHaveBeenCalledWith(draft, "Draft reloaded.");
    expect(updateTournamentDraft).not.toHaveBeenCalled();
  });

  it("dispatches one create for double submit and keeps debug output disabled", async () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const pending = createDeferred<TournamentDraft>();
    const onSaved = vi.fn();
    const draft = createTournamentDraftFixture();
    vi.mocked(createTournamentDraft).mockReturnValue(pending.promise);
    const { result } = renderHook(() =>
      useTournamentDraftForm({
        draft: null,
        disabled: false,
        onSaved,
        onBusyChange: vi.fn(),
      }),
    );
    act(() => {
      result.current.updateField("title", draft.title);
      result.current.updateField("slug", draft.slug);
    });
    let first: Promise<void>;
    let second: Promise<void>;
    act(() => {
      first = result.current.save();
      second = result.current.save();
    });
    expect(createTournamentDraft).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBe("save");
    await act(async () => {
      pending.resolve(draft);
      await Promise.all([first, second]);
    });
    expect(onSaved).toHaveBeenCalledOnce();
    expect(result.current.busy).toBe(false);
    expect(debug).not.toHaveBeenCalled();
  });

  it("aborts on unmount and ignores a late mutation result", async () => {
    const pending = createDeferred<TournamentDraft>();
    const draft = createTournamentDraftFixture();
    const onSaved = vi.fn();
    const onBusyChange = vi.fn();
    vi.mocked(updateTournamentDraft).mockReturnValue(pending.promise);
    const { result, unmount } = renderHook(() =>
      useTournamentDraftForm({ draft, disabled: false, onSaved, onBusyChange }),
    );
    let saving: Promise<void>;
    act(() => {
      saving = result.current.save();
    });
    const signal = vi.mocked(updateTournamentDraft).mock.calls[0][3];
    unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      pending.resolve(draft);
      await saving;
    });
    expect(onSaved).not.toHaveBeenCalled();
    expect(onBusyChange.mock.calls).toEqual([[true]]);
  });

  it("does not dispatch operations while the form is disabled", async () => {
    const { result } = renderHook(() =>
      useTournamentDraftForm({
        draft: createTournamentDraftFixture(),
        disabled: true,
        onSaved: vi.fn(),
        onBusyChange: vi.fn(),
      }),
    );
    await act(async () => {
      await result.current.save();
      await result.current.reload();
    });
    expect(updateTournamentDraft).not.toHaveBeenCalled();
    expect(getTournamentDraft).not.toHaveBeenCalled();
  });
});
