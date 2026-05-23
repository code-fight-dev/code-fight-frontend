import type { DocsPageData } from "./types";

function getUpdatedAtLabel() {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function getDocsPageData(): DocsPageData {
  return {
    updatedAtLabel: getUpdatedAtLabel(),
    quickLinks: [
      { href: "#docs-overview", label: "Overview" },
      { href: "#getting-started", label: "Getting Started" },
      { href: "#platform-guides", label: "Platform Guides" },
      { href: "#api-reference", label: "API Reference" },
      { href: "#monaco-editor", label: "Monaco Editor" },
      { href: "#match-lifecycle", label: "Match Lifecycle" },
      { href: "#faq", label: "FAQ" },
    ],
    heroMetrics: [
      {
        label: "7 core guides",
        value: "Platform",
        caption: "Arena, Challenges, Leaderboard, Profile, Settings, Auth, Monaco Editor",
      },
      {
        label: "2 public endpoints",
        value: "API",
        caption: "Health + location catalog endpoints for frontend integrations",
      },
      {
        label: "Live updates",
        value: "Status",
        caption: "Operational visibility through status and incident feed",
      },
    ],
    gettingStartedSteps: [
      {
        id: "create-account",
        title: "Create your account",
        summary:
          "Sign up with credentials or OAuth and verify that sign-in flow is working in your environment.",
        href: "/signup",
        ctaLabel: "Open sign up",
      },
      {
        id: "configure-profile",
        title: "Set profile and preferences",
        summary:
          "Configure display name, location, bio, and editor preferences before competitive sessions.",
        href: "/settings/profile",
        ctaLabel: "Open settings",
      },
      {
        id: "practice-workspace",
        title: "Run your first challenge",
        summary:
          "Use challenge workspace tabs, run code against public testcases, and submit your first accepted solution.",
        href: "/challenges",
        ctaLabel: "Open challenges",
      },
      {
        id: "queue-ranked-match",
        title: "Join a live arena match",
        summary:
          "Choose queue mode, accept match prompts, and complete a full end-to-end duel flow.",
        href: "/arena",
        ctaLabel: "Open arena",
      },
    ],
    guideCards: [
      {
        id: "arena-guide",
        title: "Arena Matchmaking",
        meta: "Realtime duels",
        href: "/arena",
        bullets: [
          "Queue states, accept window, and cancellation logic",
          "Match room layout, score strip, and submission pipeline",
          "Replay experience and playback controls",
        ],
      },
      {
        id: "challenges-guide",
        title: "Challenges Workspace",
        meta: "Solo practice",
        href: "/challenges",
        bullets: [
          "Search, filter, and topic-driven discovery",
          "Problem/editor split with adaptive mobile layout",
          "Output console, testcase panel, and submission history",
        ],
      },
      {
        id: "leaderboard-guide",
        title: "Leaderboard & Ranking",
        meta: "Competitive visibility",
        href: "/leaderboard",
        bullets: [
          "Podium and paginated rankings",
          "Mobile cards and desktop table behavior",
          "Rank guide mapped to tiers and rating bands",
        ],
      },
      {
        id: "profile-guide",
        title: "Player Profile",
        meta: "Identity and performance",
        href: "/settings/profile",
        bullets: [
          "Elo progression chart and rank indicators",
          "Recent matches with mobile/desktop variants",
          "Top languages and regional/global position",
        ],
      },
      {
        id: "settings-guide",
        title: "Settings System",
        meta: "Personalization",
        href: "/settings/appearance",
        bullets: [
          "Profile, appearance, performance, and editor sections",
          "Responsive sidebar-to-stack transitions",
          "Preference persistence and immediate UI updates",
        ],
      },
      {
        id: "monaco-editor-guide",
        title: "Monaco Editor Guide",
        meta: "Developer experience",
        href: "#monaco-editor",
        bullets: [
          "How to open and configure editor settings quickly",
          "Theme sync, typography, and behavior preferences",
          "Recommendations for competitive coding sessions",
        ],
      },
      {
        id: "auth-guide",
        title: "Authentication",
        meta: "Access control",
        href: "/signin",
        bullets: [
          "Credential and OAuth entry points",
          "Protected route redirects for private pages",
          "Error surface patterns for auth failures",
        ],
      },
    ],
    apiSnippet: `const response = await fetch("/api/health", {\n  method: "GET",\n  headers: { "Content-Type": "application/json" },\n});\n\nif (!response.ok) {\n  throw new Error("Health check failed");\n}\n\nconst payload = await response.json();\nconsole.log(payload);`,
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/health",
        auth: "Public",
        description:
          "Service heartbeat endpoint for readiness checks and lightweight monitoring.",
      },
      {
        method: "GET",
        path: "/api/locations",
        auth: "Public",
        description:
          "Location catalog used by profile settings location selector and related forms.",
      },
    ],
    monacoGuide: {
      title: "Monaco Editor Configuration",
      description:
        "CodeFight workspaces use Monaco Editor. Each player can customize behavior and typography from profile settings.",
      settingsHref: "/settings/editor",
      previewSnippet: `function solve(nums: number[]): number {\n  const counts = new Map<number, number>();\n\n  for (const value of nums) {\n    counts.set(value, (counts.get(value) ?? 0) + 1);\n  }\n\n  let best = 0;\n  for (const [_, frequency] of counts) {\n    best = Math.max(best, frequency);\n  }\n\n  return best;\n}`,
      capabilities: [
        "Theme sync with app light/dark mode",
        "Font family, size, line height, and tab size",
        "Word wrap, minimap, smooth scrolling, format on paste",
        "Cursor blinking style and custom top/bottom padding",
      ],
      setupSteps: [
        "Open Settings and choose Editor section.",
        "Tune behavior options first (wrap, minimap, cursor).",
        "Tune typography options (font family, size, spacing).",
        "Validate changes in live preview and keep the preset.",
      ],
    },
    lifecycleSteps: [
      {
        id: "queued",
        title: "Queued",
        description:
          "Player enters matchmaking with selected queue settings (mode and rated flag).",
      },
      {
        id: "accept-phase",
        title: "Accept phase",
        description:
          "Both players receive a timed accept window; room is created only after dual confirmation.",
      },
      {
        id: "active-room",
        title: "Active room",
        description:
          "Challenge statement, code editor, testcases, and score strip run in synchronized realtime mode.",
      },
      {
        id: "submission",
        title: "Submission",
        description:
          "Code execution and result status are reflected in workspace panels with current match state.",
      },
      {
        id: "replay",
        title: "Replay and analysis",
        description:
          "Completed matches can be replayed through checkpoints and timeline controls for post-match review.",
      },
    ],
    faqEntries: [
      {
        id: "faq-ranked",
        question: "When does a match affect rating?",
        answer:
          "Only rated matches update Elo. Unrated sessions are useful for warm-up and experimentation.",
      },
      {
        id: "faq-auth",
        question: "Why am I redirected to sign in?",
        answer:
          "Arena rooms, replay rooms, and settings routes are protected and require an authenticated viewer session.",
      },
      {
        id: "faq-layout",
        question: "How does layout adapt on smaller screens?",
        answer:
          "Complex desktop tables and split-panels switch to stacked cards and mobile overlays at responsive breakpoints.",
      },
      {
        id: "faq-status",
        question: "Where can I check platform availability?",
        answer:
          "Use the status page for component health, incident feed, and public status source links.",
      },
      {
        id: "faq-support",
        question: "What is the best way to report an issue?",
        answer:
          "Provide route, expected behavior, actual behavior, and if possible a short reproduction scenario.",
      },
    ],
  };
}
