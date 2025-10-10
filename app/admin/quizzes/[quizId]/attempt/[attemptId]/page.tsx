// app/admin/quizzes/[quizId]/attempt/[attemptId]/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

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

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      student: true,
      quiz: true,
      UserAnswer: { include: { question: true } }, // match your schema
    },
  });

  if (!attempt) {
    return <div className="text-center mt-8">Attempt not found.</div>;
  }

  // Teacher can only grade their own quizzes
  if (
    session.user.role === "TEACHER" &&
    session.user.id !== attempt.quiz.teacherId
  ) {
    redirect("/unauthorized");
  }

  const questions = await prisma.question.findMany({
    where: { quizId: attempt.quizId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">
        Reviewing {attempt.quiz.title}
      </h1>
      <h2 className="text-xl text-gray-700 mb-6">
        Student: {attempt.student.name}
      </h2>
    </div>
  );
}
