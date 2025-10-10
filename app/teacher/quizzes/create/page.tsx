// app/teacher/quizzes/create/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import QuizCreationWrapper from "./quiz-creation-wrapper";

export default async function CreateQuizPage() {
  const session = await auth();
  if (session?.user?.role !== "TEACHER") {
    redirect("/unauthorized");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      <QuizCreationWrapper />
    </div>
  );
}
