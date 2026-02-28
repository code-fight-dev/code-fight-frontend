export type ArenaEdgeCard = {
  id: string;
  title: string;
  description: string;
  icon: "realtime" | "elo" | "replay";
};

export type ArenaEdgeSnapshot = {
  eyebrow: string;
  title: string;
  description: string;
  cards: ArenaEdgeCard[];
};
