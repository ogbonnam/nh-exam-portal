// app/student/quiz/[quizId]/page.tsx
import React from "react";
import { getQuizData } from "@/app/student/actions";
import QuizClient from "./quiz-client";

export default async function QuizPage({ params }: { params: { quizId: string } }) {
  // await the proxied params once and reuse
  const p = await params;
  const quizId = p.quizId;
  if (!quizId) throw new Error("Missing quizId in route params");

  const {
    quiz,
    attempt,
    existingAnswers,
    questions,
    startTimeISO,
    endTimeISO,
    serverNowISO,
  } = await getQuizData(quizId);

  return (
    <QuizClient
      quiz={quiz}
      attempt={attempt}
      existingAnswers={existingAnswers}
      questions={questions}
      startTimeISO={startTimeISO}
      endTimeISO={endTimeISO}
      serverNowISO={serverNowISO}
    />
  );
}
