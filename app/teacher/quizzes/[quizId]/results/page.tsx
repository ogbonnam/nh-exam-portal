// app/teacher/quizzes/[quizId]/results/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient, Quiz, QuizAttempt, Question, User } from "@prisma/client";
import Link from "next/link";
import ResultsClient from "./ResultsClient";
import ChartAndButtons from "./ChartAndButtons";

declare global {
  // single PrismaClient in dev mode to avoid connection storms
  // eslint-disable-next-line no-var
  var __next_prisma__: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.__next_prisma__ ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") global.__next_prisma__ = prisma;

type QuizWithRelations = Quiz & {
  teacher: User;
  questions: Question[];
  attempts: (QuizAttempt & { student: User })[];
};

export default async function TeacherQuizResultsPage(props: any): Promise<React.ReactElement> {
  // normalize params (handles both sync object and Promise)
  const rawParams = await Promise.resolve(props?.params);
  const params = (rawParams ?? {}) as { quizId?: string };

  const quizId = params.quizId;
  if (!quizId) {
    return <div className="text-center mt-8">Missing quiz id.</div>;
  }

  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");

  // Fetch quiz + relations
  const quiz: QuizWithRelations | null = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      teacher: true,
      questions: true,
      attempts: {
        where: { isSubmitted: true },
        include: { student: true },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!quiz) return <div className="text-center mt-8">Quiz not found.</div>;

  // Authorization: teachers may view only their quizzes
  if (user.role === "TEACHER" && user.id !== quiz.teacherId) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-gray-600">You don't have permission to view results for this quiz.</p>
        <Link href="/teacher/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Use the stored scores from the database instead of recalculating
  const attemptsWithScores = quiz.attempts.map(attempt => {
    // Use the score from the database if available, otherwise calculate it
    let score = attempt.score;
    
    // If score is null (not graded yet), calculate it
    if (score === null) {
      score = 0; // Default to 0 if not graded
    }
    
    return { attempt, score };
  });

  const studentScores = attemptsWithScores.map(({ attempt, score }) => ({
    name: attempt.student?.name ?? attempt.student?.email ?? "Unknown",
    score,
    focusLossCount: attempt.focusLossCount,
  }));

  // Calculate statistics
  const maxScore = quiz.questions.reduce((acc, q) => acc + (q.points ?? 1), 0);
  const scores = attemptsWithScores.map(({ score }) => score);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  
  // Calculate focus loss statistics
  const focusLossCounts = attemptsWithScores.map(({ attempt }) => attempt.focusLossCount);
  const totalFocusLosses = focusLossCounts.reduce((a, b) => a + b, 0);
  const averageFocusLoss = focusLossCounts.length > 0 ? totalFocusLosses / focusLossCounts.length : 0;
  const maxFocusLoss = focusLossCounts.length > 0 ? Math.max(...focusLossCounts) : 0;
  const noFocusLossCount = focusLossCounts.filter(count => count === 0).length;
  const lowFocusLossCount = focusLossCounts.filter(count => count > 0 && count <= 2).length;
  const highFocusLossCount = focusLossCounts.filter(count => count >= 3).length;

  // Calculate score distribution
  const scoreRanges = {
    excellent: scores.filter(score => score >= maxScore * 0.8).length,
    good: scores.filter(score => score >= maxScore * 0.6 && score < maxScore * 0.8).length,
    satisfactory: scores.filter(score => score >= maxScore * 0.4 && score < maxScore * 0.6).length,
    needsImprovement: scores.filter(score => score < maxScore * 0.4).length
  };

  // Calculate submission time statistics
  const submissionTimes = quiz.attempts
    .filter(attempt => attempt.submittedAt && attempt.startedAt)
    .map(attempt => {
      const submitted = new Date(attempt.submittedAt!).getTime();
      const started = new Date(attempt.startedAt).getTime();
      return Math.round((submitted - started) / 60000); // in minutes
    });

  const averageSubmissionTime = submissionTimes.length > 0 
    ? submissionTimes.reduce((a, b) => a + b, 0) / submissionTimes.length 
    : 0;

  const fastestSubmission = submissionTimes.length > 0 ? Math.min(...submissionTimes) : 0;
  const slowestSubmission = submissionTimes.length > 0 ? Math.max(...submissionTimes) : 0;

  return (
    <ResultsClient 
      quiz={quiz}
      attemptsWithScores={attemptsWithScores}
      studentScores={studentScores}
      maxScore={maxScore}
      averageScore={averageScore}
      highestScore={highestScore}
      lowestScore={lowestScore}
      totalFocusLosses={totalFocusLosses}
      averageFocusLoss={averageFocusLoss}
      maxFocusLoss={maxFocusLoss}
      noFocusLossCount={noFocusLossCount}
      lowFocusLossCount={lowFocusLossCount}
      highFocusLossCount={highFocusLossCount}
      focusLossCounts={focusLossCounts}
      scoreRanges={scoreRanges}
      averageSubmissionTime={averageSubmissionTime}
      fastestSubmission={fastestSubmission}
      slowestSubmission={slowestSubmission}
    />
  );
}