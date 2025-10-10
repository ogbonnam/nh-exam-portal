// app/admin/quizzes/[quizId]/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient, Quiz, QuizAttempt, Question, User } from "@prisma/client";
import Link from "next/link";
import QuizScoreChart from "./QuizScoreChart"; // client component

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

export default async function QuizResultsPage(props: any): Promise<React.ReactElement> {
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
      </div>
    );
  }

  // compute scores for attempts
  const attemptsWithScores = await Promise.all(
    quiz.attempts.map(async (attempt) => {
      const answers = await prisma.userAnswer.findMany({
        where: { attemptId: attempt.id },
        include: { question: { include: { options: true } } },
      });

      let score = 0;
      for (const ans of answers) {
        const q = ans.question;
        if (!q) continue;

        if (q.type === "OPTIONS") {
          const correct = q.options.find((o) => o.isCorrect);
          if (ans.optionIds && ans.optionIds[0] && correct && ans.optionIds[0] === correct.id) {
            score += q.points ?? 1;
          }
        } else if (q.type === "CHECKBOX") {
          const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
          const selected = (ans.optionIds || []).slice().sort();
          if (JSON.stringify(correctIds) === JSON.stringify(selected)) {
            score += q.points ?? 1;
          }
        } else if (q.type === "FILL_IN_THE_BLANK") {
          const studentText = ans.textAnswer?.toLowerCase().trim();
          const correctText = q.correctAnswer?.toLowerCase().trim();
          if (studentText && correctText && studentText === correctText) {
            score += q.points ?? 1;
          }
        }
        // PARAGRAPH: manual grading
      }

      return { attempt, score };
    })
  );

  const studentScores = attemptsWithScores.map(({ attempt, score }) => ({
    name: attempt.student?.name ?? attempt.student?.email ?? "Unknown",
    score,
  }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
          <p className="text-sm text-gray-500 mt-2">Created by: {quiz.teacher?.name ?? quiz.teacher?.email}</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Questions: <strong>{quiz.questions.length}</strong></p>
          <p className="text-sm text-gray-500">Submitted attempts: <strong>{quiz.attempts.length}</strong></p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Student Attempts ({quiz.attempts.length})</h2>

      {quiz.attempts.length === 0 ? (
        <p className="text-gray-600">No students have submitted this quiz yet.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow-md mb-6">
            {attemptsWithScores.map(({ attempt, score }) => (
              <li key={attempt.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{attempt.student?.name ?? attempt.student?.email}</p>
                  <p className="text-sm text-gray-500">
                    Submitted on: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "Unknown"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-lg">Score: {score}</p>
                  <Link href={`/admin/quizzes/${quiz.id}/attempt/${attempt.id}`} className="mt-2 text-blue-600 hover:underline inline-block">
                    Review & Grade
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mb-4">Scores Chart</h2>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <QuizScoreChart
              data={studentScores}
              maxScore={quiz.questions.reduce((acc, q) => acc + (q.points ?? 1), 0)}
            />
          </div>
        </>
      )}
    </div>
  );
}
