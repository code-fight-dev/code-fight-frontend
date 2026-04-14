export function SettingsPageDecor() {
  return (
    <>
      <div
        aria-hidden
        className="app-settings-page-ambient pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden
        className="app-settings-page-grid pointer-events-none absolute inset-0"
      />
    </>
  );
}

export function SettingsShellDecor() {
  return (
    <>
      <div
        aria-hidden
        className="app-settings-shell-ambient pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden
        className="app-settings-shell-grid pointer-events-none absolute inset-0"
      />
    </>
  );
}
