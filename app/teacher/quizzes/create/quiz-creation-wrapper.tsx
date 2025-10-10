// app/teacher/quizzes/create/quiz-creation-wrapper.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import the real client editor, disabling SSR
const QuizCreationClient = dynamic(() => import("./quiz-creation-client"), {
  ssr: false,
  loading: () => <p>Loading quiz editor...</p>,
});

export default function QuizCreationWrapper() {
  return <QuizCreationClient />;
}
