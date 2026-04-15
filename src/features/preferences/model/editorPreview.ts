import type { MonacoThemeName } from "./editorMonaco";

export const EDITOR_PREVIEW_CODE = `type Duelist = {
  id: string;
  elo: number;
  region?: "EU" | "NA";
};

const hasAccess = duelist?.elo >= 1800 && duelist?.region === "EU";
const sameRank = left === right;
const differentRank = left !== right;
const nextValue = input ?? fallback;

export function selectFeaturedPlayers(players: Duelist[]): Duelist[] {
  return players
    .filter((player) => player.elo >= 1800)
    .sort((left, right) => right.elo - left.elo)
    .slice(0, 3);
}

// Ligature sample: === !== >= <= => ?? && ||
`;

export function getEditorPreviewThemeLabel(theme: MonacoThemeName) {
  return theme === "codefight-light" ? "Light" : "Dark";
}
