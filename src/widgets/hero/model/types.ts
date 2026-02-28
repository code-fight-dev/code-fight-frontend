export type HeroDeveloper = {
  id: string;
  initials: string;
  tintClassName: string;
};

export type HeroSnapshot = {
  liveLabel: string;
  queueCount: number;
  featuredDevelopers: HeroDeveloper[];
};
