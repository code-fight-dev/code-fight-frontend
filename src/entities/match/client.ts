"use client";

export {
  createMatchSubmission,
  getCurrentMatch,
  getMatch,
  getMatchReplay,
  joinQueue,
  leaveQueue,
  startMatch,
  surrenderMatch,
  type CreateMatchSubmissionPayload,
  type JoinQueueInput,
} from "./api/client";
export { subscribeArenaEvents } from "./api/events";
