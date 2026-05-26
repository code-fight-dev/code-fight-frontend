import { describe, expect, it } from "vitest";

import { parseLeaderboardViewQuery } from "@/views/leaderboard/model/parseLeaderboardSearchParams";

describe("views/leaderboard/model/parseLeaderboardSearchParams", () => {
  it("returns empty query for non-object params", () => {
    expect(parseLeaderboardViewQuery(null)).toEqual({});
    expect(parseLeaderboardViewQuery(undefined)).toEqual({});
    expect(parseLeaderboardViewQuery("page=1")).toEqual({});
  });

  it("parses string search params", () => {
    expect(
      parseLeaderboardViewQuery({
        mode: " global ",
        page: "2",
        pageSize: "25",
      }),
    ).toEqual({
      mode: "global",
      page: 2,
      pageSize: 25,
    });
  });

  it("uses the first value from array search params", () => {
    expect(
      parseLeaderboardViewQuery({
        mode: ["friends", "global"],
        page: ["3", "4"],
        pageSize: ["50", "100"],
      }),
    ).toEqual({
      mode: "friends",
      page: 3,
      pageSize: 50,
    });
  });

  it("ignores invalid search param values", () => {
    expect(
      parseLeaderboardViewQuery({
        mode: 123,
        page: ["1", 2],
        pageSize: false,
        limit: {},
        offset: [],
      }),
    ).toEqual({});
  });

  it("ignores blank mode and invalid positive integer params", () => {
    expect(
      parseLeaderboardViewQuery({
        mode: "   ",
        page: "0",
        pageSize: "-10",
      }),
    ).toEqual({});
  });

  it("falls back from pageSize to limit", () => {
    expect(
      parseLeaderboardViewQuery({
        page: "2",
        pageSize: "invalid",
        limit: "30",
      }),
    ).toEqual({
      page: 2,
      pageSize: 30,
    });
  });

  it("prefers pageSize over limit when both are valid", () => {
    expect(
      parseLeaderboardViewQuery({
        page: "2",
        pageSize: "20",
        limit: "50",
      }),
    ).toEqual({
      page: 2,
      pageSize: 20,
    });
  });

  it("derives page from offset and pageSize when page is missing", () => {
    expect(
      parseLeaderboardViewQuery({
        pageSize: "10",
        offset: "20",
      }),
    ).toEqual({
      page: 3,
      pageSize: 10,
    });
  });

  it("derives page from offset and limit when pageSize is missing", () => {
    expect(
      parseLeaderboardViewQuery({
        limit: "25",
        offset: "50",
      }),
    ).toEqual({
      page: 3,
      pageSize: 25,
    });
  });

  it("does not derive page when offset is invalid", () => {
    expect(
      parseLeaderboardViewQuery({
        pageSize: "10",
        offset: "-1",
      }),
    ).toEqual({
      pageSize: 10,
    });
  });

  it("keeps explicit page over derived offset page", () => {
    expect(
      parseLeaderboardViewQuery({
        page: "5",
        pageSize: "10",
        offset: "20",
      }),
    ).toEqual({
      page: 5,
      pageSize: 10,
    });
  });

  it("parses integers with parseInt semantics", () => {
    expect(
      parseLeaderboardViewQuery({
        page: "2.9",
        pageSize: "15px",
        offset: "30px",
      }),
    ).toEqual({
      page: 2,
      pageSize: 15,
    });
  });
});
