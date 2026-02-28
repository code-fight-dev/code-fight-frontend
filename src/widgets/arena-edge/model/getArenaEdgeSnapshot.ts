import "server-only";
import type { ArenaEdgeSnapshot } from "./types";

const ARENA_EDGE_SNAPSHOT: ArenaEdgeSnapshot = {
  eyebrow: "The Arena Edge",
  title: "Engineered for Competition",
  description:
    "Experience the most advanced competitive coding environment ever built, designed by pros for pros.",
  cards: [
    {
      id: "real-time-coding",
      title: "Real-time Coding",
      description:
        "Synchronized IDE with sub-millisecond latency. Watch your opponent's cursor in real-time as you race to the solution.",
      icon: "realtime",
    },
    {
      id: "elo-system",
      title: "Elo System",
      description:
        "Advanced matchmaking algorithm derived from Chess grandmaster standards, ensuring fair play and accurate representation.",
      icon: "elo",
    },
    {
      id: "replay-system",
      title: "Replay System",
      description:
        "Analyze every keystroke with our comprehensive match replay engine and heat-map analysis tools.",
      icon: "replay",
    },
  ],
};

export async function getArenaEdgeSnapshot(): Promise<ArenaEdgeSnapshot> {
  return ARENA_EDGE_SNAPSHOT;
}
