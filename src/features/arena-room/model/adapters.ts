import type { TaskSubmission } from "@/entities/challenge";
import type { MatchSubmission } from "@/entities/match";

export function toTaskSubmissionFromMatchSubmission(
  submission: MatchSubmission,
): TaskSubmission {
  return {
    id: submission.id,
    ...(submission.matchId ? { matchId: submission.matchId } : {}),
    taskId: submission.taskId,
    userId: submission.userId,
    language: submission.language,
    languageVersion: submission.languageVersion,
    sourceCode: submission.sourceCode,
    status: submission.status,
    ...(submission.verdict ? { verdict: submission.verdict } : {}),
    ...(submission.judgeSubmissionId
      ? { judgeSubmissionId: submission.judgeSubmissionId }
      : {}),
    ...(submission.judgeStatus ? { judgeStatus: submission.judgeStatus } : {}),
    ...(submission.errorMessage ? { errorMessage: submission.errorMessage } : {}),
    passedTests: submission.passedTests,
    totalTests: submission.totalTests,
    ...(submission.compileTimeMs !== undefined
      ? { compileTimeMs: submission.compileTimeMs }
      : {}),
    ...(submission.runTimeMs !== undefined ? { runTimeMs: submission.runTimeMs } : {}),
    ...(submission.peakMemoryKb !== undefined
      ? { peakMemoryKb: submission.peakMemoryKb }
      : {}),
    score: submission.score,
    ...(submission.exitCode !== undefined ? { exitCode: submission.exitCode } : {}),
    ...(submission.compileLog ? { compileLog: submission.compileLog } : {}),
    ...(submission.stdoutTruncated
      ? { stdoutTruncated: submission.stdoutTruncated }
      : {}),
    ...(submission.stderrTruncated
      ? { stderrTruncated: submission.stderrTruncated }
      : {}),
    createdAt: submission.createdAt,
    ...(submission.startedAt ? { startedAt: submission.startedAt } : {}),
    ...(submission.finishedAt ? { finishedAt: submission.finishedAt } : {}),
    updatedAt: submission.updatedAt,
    testResults: submission.testResults.map((testResult) => ({
      testCaseId: testResult.testCaseId,
      status: testResult.status,
      ...(testResult.timeMs !== undefined ? { timeMs: testResult.timeMs } : {}),
      ...(testResult.memoryKb !== undefined ? { memoryKb: testResult.memoryKb } : {}),
      ...(testResult.exitCode !== undefined ? { exitCode: testResult.exitCode } : {}),
      ...(testResult.checkerMessage ? { checkerMessage: testResult.checkerMessage } : {}),
    })),
  };
}
