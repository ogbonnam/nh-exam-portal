// app/admin/quizzes/[quizId]/attempt/[attemptId]/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import React from "react";

const prisma = new PrismaClient();

export default async function ReviewAttemptPage({
  params,
}: {
  params: { quizId: string; attemptId: string };
}) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/unauthorized");
  }

  // Fetch attempt with relations:
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      student: true,
      quiz: true,
      UserAnswer: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    return <div className="text-center mt-8">Attempt not found.</div>;
  }

  // Teacher may only view their own quiz attempts
  if (
    session.user.role === "TEACHER" &&
    session.user.id !== attempt.quiz.teacherId
  ) {
    redirect("/unauthorized");
  }

  // Compute score (same logic as submitQuiz)
  let computedScore = 0;
  const perQuestionResults: Array<{
    questionId: string;
    questionText: string;
    type: string;
    points: number;
    isCorrect: boolean | null; // null for paragraph/manual
    studentAnswer: string | string[] | null;
    correctAnswerDisplay: string;
  }> = [];

  // Map answers by questionId
  const answersByQ: Record<string, any> = {};
  for (const a of attempt.UserAnswer || []) {
    answersByQ[a.questionId] = a;
  }

  // We need the quiz questions with options to compute correctness.
  const questions = await prisma.question.findMany({
    where: { quizId: attempt.quizId },
    include: { options: true },
    orderBy: { createdAt: "asc" },
  });

  for (const q of questions) {
    const ans = answersByQ[q.id];
    let isCorrect: boolean | null = null;
    let studentAnswer: string | string[] | null = null;
    let correctAnswerDisplay = "";

    if (q.type === "OPTIONS") {
      const correctOpt = q.options.find((o) => o.isCorrect);
      correctAnswerDisplay = correctOpt ? `${correctOpt.text} (${correctOpt.id})` : "—";
      if (ans?.optionIds && ans.optionIds.length > 0) {
        studentAnswer = ans.optionIds[0];
        isCorrect = ans.optionIds[0] === correctOpt?.id;
        if (isCorrect) computedScore += q.points ?? 1;
      } else {
        studentAnswer = null;
        isCorrect = false;
      }
    } else if (q.type === "CHECKBOX") {
      const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
      correctAnswerDisplay = q.options
        .filter((o) => o.isCorrect)
        .map((o) => `${o.text} (${o.id})`)
        .join(", ") || "—";
      const selected = (ans?.optionIds || []).slice().sort();
      studentAnswer = selected;
      isCorrect = JSON.stringify(correctIds) === JSON.stringify(selected);
      if (isCorrect) computedScore += q.points ?? 1;
    } else if (q.type === "FILL_IN_THE_BLANK") {
      correctAnswerDisplay = q.correctAnswer ?? "—";
      studentAnswer = ans?.textAnswer ?? null;
      if (ans?.textAnswer && q.correctAnswer) {
        isCorrect =
          ans.textAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        if (isCorrect) computedScore += q.points ?? 1;
      } else {
        isCorrect = false;
      }
    } else if (q.type === "PARAGRAPH") {
      // paragraph questions require manual grading
      correctAnswerDisplay = q.correctAnswer ?? "Manual grading required";
      studentAnswer = ans?.textAnswer ?? null;
      isCorrect = null; // unknown / manual
    }

    perQuestionResults.push({
      questionId: q.id,
      questionText: q.text,
      type: q.type,
      points: q.points ?? 1,
      isCorrect,
      studentAnswer,
      correctAnswerDisplay,
    });
  }

  // Optionally: if DB already stores attempt.score, prefer that
  const displayedScore =
    typeof attempt.score === "number" ? attempt.score : computedScore;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{attempt.quiz.title}</h1>
          <p className="text-sm text-gray-600">{attempt.quiz.description}</p>
          <p className="text-sm mt-2">
            Student: <strong>{attempt.student?.name ?? attempt.student?.email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Attempt started: {attempt.startedAt?.toLocaleString() || "Unknown"} — submitted:{" "}
            {attempt.submittedAt ? attempt.submittedAt.toLocaleString() : "Not submitted"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold">Score</p>
          <p className="text-3xl font-bold text-indigo-600">{displayedScore}</p>
          <p className="text-sm text-gray-500">Points awarded (computed)</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Questions & Answers</h2>

        <ol className="space-y-4">
          {perQuestionResults.map((r, idx) => (
            <li key={r.questionId} className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                      {idx + 1}
                    </span>
                    <h3 className="text-lg font-medium">{r.questionText}</h3>
                    <span className="ml-2 text-sm text-gray-500">({r.type})</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{/* optional additional text */}</p>
                  <p className="mt-2 text-sm">
                    <strong>Points:</strong> {r.points}
                  </p>
                </div>

                <div className="text-right">
                  {r.isCorrect === true && (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm font-medium">
                      Correct
                    </span>
                  )}
                  {r.isCorrect === false && (
                    <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-sm font-medium">
                      Incorrect
                    </span>
                  )}
                  {r.isCorrect === null && (
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm font-medium">
                      Manual
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Student answer(s):</p>
                  <div className="bg-gray-50 p-3 rounded">
                    {r.studentAnswer == null || (Array.isArray(r.studentAnswer) && r.studentAnswer.length === 0) ? (
                      <span className="text-gray-500">No answer provided</span>
                    ) : Array.isArray(r.studentAnswer) ? (
                      <ul className="list-disc pl-5">
                        {r.studentAnswer.map((id) => (
                          <li key={id} className="text-sm">
                            <code className="text-xs text-gray-700">{id}</code>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm">
                        <code className="text-xs text-gray-700">{String(r.studentAnswer)}</code>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Correct answer(s):</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">{r.correctAnswerDisplay}</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
