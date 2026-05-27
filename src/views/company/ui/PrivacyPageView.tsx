import { Database, Eye, Lock, Shield } from "lucide-react";
import { CompanyPageShell } from "./CompanyPageShell";

const PRIVACY_LAST_UPDATED = "May 26, 2026";

export function PrivacyPageView() {
  return (
    <CompanyPageShell
      activePage="privacy"
      kicker="Company"
      title="Privacy"
      description="We keep privacy simple: collect what we need to run the platform, protect it responsibly, and avoid unnecessary data exposure."
    >
      <div className="grid gap-4">
        <article className="app-shell-card-soft rounded-3xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-[1.25rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
              Summary
            </h2>
            <span className="rounded-xl border border-(--app-surface-soft-border) bg-(--app-surface-input) px-3 py-1.5 text-[12px] tracking-[0.08em] text-(--app-text-faint) uppercase">
              Last updated: {PRIVACY_LAST_UPDATED}
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-[1.7] tracking-[-0.02em] text-(--app-text-soft)">
            CodeFight is an educational product developed by students. This page explains
            what data we use and why. We do not sell personal data.
          </p>
        </article>

        <article className="app-shell-card-soft rounded-3xl p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
            <Database className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
          <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            Data we may process
          </h3>
          <ul className="mt-3 space-y-2 text-[14px] leading-[1.65] tracking-[-0.02em] text-(--app-text-soft)">
            <li>
              Email, username, and authentication data needed to access the platform.
            </li>
            <li>Session and security-related metadata to keep accounts protected.</li>
            <li>Challenge and arena activity data required for product functionality.</li>
          </ul>
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="app-shell-card-soft rounded-3xl p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
              <Lock className="h-4.5 w-4.5" strokeWidth={2.1} />
            </span>
            <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
              How we use it
            </h3>
            <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
              We use data to operate accounts, run coding matches, improve reliability,
              and monitor platform health and abuse prevention.
            </p>
          </article>

          <article className="app-shell-card-soft rounded-3xl p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
              <Eye className="h-4.5 w-4.5" strokeWidth={2.1} />
            </span>
            <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
              Third-party services
            </h3>
            <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
              Depending on enabled features, we may rely on providers such as OAuth
              services and transactional email tools to support sign-in and account
              recovery.
            </p>
          </article>
        </div>

        <article className="app-shell-card-soft rounded-3xl p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 text-blue-300">
            <Shield className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
          <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            Your choices
          </h3>
          <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-soft)">
            If you want to ask about your data or request deletion of your account data,
            use our GitHub organization contact channel on the Contact page and include
            enough detail for verification.
          </p>
        </article>
      </div>
    </CompanyPageShell>
  );
}
