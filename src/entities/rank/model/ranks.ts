export type RankTier = "E" | "D" | "C" | "B" | "A" | "S";

export type RankConfig = {
  tier: RankTier;
  title: string;
  min: number;
  max: number | null;
  color: string;
  summary: string;
  focus: string;
};

export const RANKS: ReadonlyArray<RankConfig> = [
  {
    tier: "E",
    title: "Entry",
    min: 0,
    max: 1249,
    color: "#6E6C6A",
    summary:
      "Entry tier for players building their competitive programming base. At this level, improvement comes from learning core algorithms, writing more reliable solutions, and reducing basic implementation mistakes.",
    focus:
      "Strengthen fundamentals, reduce simple errors, and build confidence in solving under time pressure.",
  },
  {
    tier: "D",
    title: "Contender",
    min: 1250,
    max: 1499,
    color: "#248423",
    summary:
      "Players here have a more stable grasp of standard techniques and can solve familiar problem types with growing confidence. The next step is improving speed, debugging discipline, and consistency across matches.",
    focus:
      "Solve standard problems faster, debug more cleanly, and improve consistency from start to finish.",
  },
  {
    tier: "C",
    title: "Operator",
    min: 1500,
    max: 1749,
    color: "#3C4FD1",
    summary:
      "This tier reflects solid competitive ability: stronger algorithmic knowledge, better pattern recognition, and more reliable execution during contests. Players begin adapting faster and making better decisions when the first idea fails.",
    focus:
      "Sharpen algorithm selection, recover faster from wrong approaches, and improve mid-contest decision-making.",
  },
  {
    tier: "B",
    title: "Vanguard",
    min: 1750,
    max: 1999,
    color: "#9D1F82",
    summary:
      "High-level players with strong implementation speed, cleaner logic, and better awareness of edge cases. They handle pressure more effectively, spot weaker solutions faster, and convert good reads into accepted submissions more consistently.",
    focus:
      "Improve precision, handle edge cases better, and maintain speed without sacrificing correctness.",
  },
  {
    tier: "A",
    title: "Elite",
    min: 2000,
    max: 2199,
    color: "#9D121E",
    summary:
      "Elite competitive programmers who combine advanced algorithmic knowledge with fast reasoning and disciplined execution. At this level, small mistakes are punished hard, and success depends on efficient thinking, accurate coding, and strong contest control.",
    focus:
      "Refine advanced problem-solving, code with maximum accuracy, and outperform strong opponents through better decisions.",
  },
  {
    tier: "S",
    title: "Ascendant",
    min: 2200,
    max: null,
    color: "#D5A916",
    summary:
      "Top-tier competitors who consistently perform at an elite level across difficult problems and strong lobbies. They read problems quickly, identify strong solution paths, and maintain exceptional accuracy, speed, and adaptability throughout the match.",
    focus:
      "Sustain top-level performance, master difficult scenarios, and keep pushing beyond elite competitive standards.",
  },
];

const integerFormatter = new Intl.NumberFormat("en-US");
const DEFAULT_RANK = RANKS[0];

function isRatingWithinRank(rank: Pick<RankConfig, "min" | "max">, rating: number) {
  return rating >= rank.min && (rank.max === null || rating <= rank.max);
}

function getRankIndex(rating: number) {
  return RANKS.findIndex((rank) => isRatingWithinRank(rank, rating));
}

export function getRankByRating(rating: number) {
  return RANKS.find((rank) => isRatingWithinRank(rank, rating)) ?? DEFAULT_RANK;
}

export function getNextRank(rating: number) {
  const currentIndex = getRankIndex(rating);

  if (currentIndex === -1 || currentIndex === RANKS.length - 1) {
    return null;
  }

  return RANKS[currentIndex + 1];
}

export function getRankGradient(fromColor: string, toColor?: string | null) {
  const targetColor = toColor || fromColor;

  return `linear-gradient(90deg, ${fromColor} 0%, ${targetColor} 100%)`;
}

export function formatRankValue(value: number) {
  return integerFormatter.format(value);
}

export function formatRankRange(rank: Pick<RankConfig, "min" | "max">) {
  if (rank.max === null) {
    return `${formatRankValue(rank.min)}+ Elo`;
  }

  return `${formatRankValue(rank.min)}-${formatRankValue(rank.max)} Elo`;
}
