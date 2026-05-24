import { describe, expect, it } from "vitest";

import { getChallengeTopicLabels } from "@/entities/challenge";

describe("getChallengeTopicLabels", () => {
  it("returns tags as topic labels for algorithmic challenge", () => {
    expect(
      getChallengeTopicLabels({
        kind: "algorithmic",
        tags: ["Arrays", "Hash Map"],
      }),
    ).toEqual(["Arrays", "Hash Map"]);
  });

  it("adds SQL topic for SQL challenge", () => {
    expect(
      getChallengeTopicLabels({
        kind: "sql",
        tags: ["Joins", "Aggregation"],
      }),
    ).toEqual(["SQL", "Joins", "Aggregation"]);
  });

  it("does not duplicate SQL topic when SQL tag already exists", () => {
    expect(
      getChallengeTopicLabels({
        kind: "sql",
        tags: ["SQL", "Joins"],
      }),
    ).toEqual(["SQL", "Joins"]);
  });

  it("removes duplicated tags while preserving order", () => {
    expect(
      getChallengeTopicLabels({
        kind: "algorithmic",
        tags: ["Arrays", "Hash Map", "Arrays"],
      }),
    ).toEqual(["Arrays", "Hash Map"]);
  });

  it("returns only SQL topic for SQL challenge without tags", () => {
    expect(
      getChallengeTopicLabels({
        kind: "sql",
        tags: [],
      }),
    ).toEqual(["SQL"]);
  });

  it("returns empty list for algorithmic challenge without tags", () => {
    expect(
      getChallengeTopicLabels({
        kind: "algorithmic",
        tags: [],
      }),
    ).toEqual([]);
  });
});
