// app/student/quiz/[quizId]/page.tsx
import React from "react";
import { getQuizData } from "@/app/student/actions";
import QuizClient from "./quiz-client";

export default async function QuizPage(props: any): Promise<React.ReactElement> {
  // tolerate both { params } and { params: Promise<...> }
  const rawParams = await Promise.resolve(props?.params);
  const params = (rawParams ?? {}) as { quizId?: string };
  const quizId = params.quizId;
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
