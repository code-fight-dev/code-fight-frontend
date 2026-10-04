"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { managementErrorMessage } from "@/shared/api/management";
import { Button } from "@/shared/ui/Button";
import { changeAccountRole, getManagedUser } from "../api/roles";
import type { ManagedUser } from "../api/roles";

const fieldClass =
  "mt-2 w-full rounded-xl border border-(--app-control-secondary-border) bg-(--app-control-secondary-bg) px-4 py-3 text-(--app-text-strong) focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

export function AccountRolesPanel() {
  const [id, setId] = useState("");
  const [user, setUser] = useState<ManagedUser | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    setUser(null);
    setReason("");
    try {
      setUser(await getManagedUser(id.trim()));
    } catch (error) {
      setError(managementErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || user.role === "admin" || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const next = await changeAccountRole(
        user,
        user.role === "organizer" ? "user" : "organizer",
        reason,
      );
      // console.debug("[management.role.changed]", {
      //   accountId: user.id, previousRole: user.role, assignedRole: next.role,
      //   expectedVersion: user.roleVersion, appliedVersion: next.roleVersion,
      //   versionAdvanced: next.roleVersion > user.roleVersion,
      // });
      setUser(next);
      setReason("");
      setNotice(`Role updated: ${next.username} is now ${next.role}.`);
    } catch (error) {
      setError(managementErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-surface max-w-2xl rounded-3xl border border-(--app-control-secondary-border) p-6">
      <form onSubmit={(event) => void lookup(event)} className="grid gap-4">
        <label className="text-sm">
          Account ID
          <input
            className={fieldClass}
            required
            value={id}
            disabled={busy}
            onChange={(event) => {
              setId(event.target.value);
              setUser(null);
              setNotice("");
            }}
            placeholder="Account UUID"
          />
        </label>
        <Button type="submit" disabled={busy} className="justify-self-start">
          Load account
        </Button>
      </form>
      {user && (
        <div className="mt-6 border-t border-(--app-control-secondary-border) pt-6">
          <h2 className="text-xl font-semibold">{user.username}</h2>
          <p className="mt-2 text-sm text-(--app-text-soft)">Current role: {user.role}</p>
          {user.role === "admin" ? (
            <p className="mt-4 text-sm">Administrator roles cannot be changed here.</p>
          ) : (
            <form
              onSubmit={(event) => void changeRole(event)}
              className="mt-5 grid gap-4"
            >
              <label className="text-sm">
                Reason
                <textarea
                  className={fieldClass}
                  required
                  maxLength={500}
                  value={reason}
                  disabled={busy}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                />
              </label>
              <Button
                type="submit"
                disabled={busy || !reason.trim()}
                className="justify-self-start"
              >
                {user.role === "organizer"
                  ? "Revoke organizer role"
                  : "Grant organizer role"}
              </Button>
            </form>
          )}
        </div>
      )}
      {busy && (
        <p role="status" className="mt-4 text-sm">
          Working…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm">
          {notice}
        </p>
      )}
    </div>
  );
}
