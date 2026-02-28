import "server-only";

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

const HERO_SNAPSHOT: HeroSnapshot = {
  liveLabel: "Live Season",
  queueCount: 12438,
  featuredDevelopers: [
    { id: "ava", initials: "AV", tintClassName: "from-[#f2d6c5] to-[#8f6a5f]" },
    { id: "mk", initials: "MK", tintClassName: "from-[#dadfeb] to-[#6f7fa1]" },
    { id: "ln", initials: "LN", tintClassName: "from-[#f0e0d2] to-[#9f8074]" },
  ],
};

export async function getHeroSnapshot(): Promise<HeroSnapshot> {
  // Replace this with a low-latency queue stats read (Redis or internal API),
  // not a raw COUNT(*) query on every page request.
  return HERO_SNAPSHOT;
}
