import { isRecord, managementRequest } from "@/shared/api/management";

export type TournamentStatus = "published" | "running" | "completed";

export type PublishedTournament = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: TournamentStatus;
  ownerId: string;
  configVersion: number;
};

type Standing = {
  userId: string;
  username: string;
  played: number;
  wins: number;
  draws: number;
  points: number;
};

type Fixture = {
  id: string;
  player1: string;
  player2: string;
  matchId: string | null;
  status: string;
};

export type TournamentBoard = {
  tournament: PublishedTournament;
  standings: Standing[];
  fixtures: Fixture[];
};

function isTournament(value: unknown): value is PublishedTournament {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.ownerId === "string" &&
    typeof value.configVersion === "number" &&
    (value.status === "published" ||
      value.status === "running" ||
      value.status === "completed")
  );
}

function isStanding(value: unknown): value is Standing {
  return (
    isRecord(value) &&
    typeof value.userId === "string" &&
    typeof value.username === "string" &&
    typeof value.played === "number" &&
    typeof value.wins === "number" &&
    typeof value.draws === "number" &&
    typeof value.points === "number"
  );
}

function isFixture(value: unknown): value is Fixture {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.player1 === "string" &&
    typeof value.player2 === "string" &&
    typeof value.status === "string" &&
    (value.matchId === null || typeof value.matchId === "string")
  );
}

export async function listPublishedTournaments(signal?: AbortSignal) {
  const body = await managementRequest("/tournaments", { signal });
  if (!isRecord(body) || !Array.isArray(body.items) || !body.items.every(isTournament)) {
    throw new Error("Invalid tournament list");
  }
  return body.items as PublishedTournament[];
}

export async function getTournamentBoard(
  id: string,
  signal?: AbortSignal,
): Promise<TournamentBoard> {
  const body = await managementRequest("/tournaments/" + encodeURIComponent(id), {
    signal,
  });
  if (
    !isRecord(body) ||
    !isTournament(body.tournament) ||
    !Array.isArray(body.standings) ||
    !body.standings.every(isStanding) ||
    !Array.isArray(body.fixtures) ||
    !body.fixtures.every(isFixture)
  ) {
    throw new Error("Invalid tournament results");
  }
  return {
    tournament: body.tournament,
    standings: body.standings,
    fixtures: body.fixtures,
  };
}

export function joinTournament(id: string) {
  return managementRequest("/tournaments/" + encodeURIComponent(id) + "/join", {
    method: "POST",
  });
}

export function changeTournamentStatus(
  id: string,
  status: TournamentStatus,
  expectedConfigVersion: number,
  taskSlug?: string,
) {
  return managementRequest(
    "/organizer/tournaments/" + encodeURIComponent(id) + "/status",
    {
      method: "POST",
      body: { status, expectedConfigVersion, taskSlug },
    },
  );
}

export function scheduleTournamentMatch(id: string, fixtureId: string) {
  return managementRequest(
    "/organizer/tournaments/" +
      encodeURIComponent(id) +
      "/fixtures/" +
      encodeURIComponent(fixtureId),
    { method: "POST" },
  );
}
