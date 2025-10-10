// app/admin/quizzes/[quizId]/attempt/[attemptId]/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

declare global {
  // Single PrismaClient instance in dev to avoid connection storm
  // eslint-disable-next-line no-var
  var __next_prisma__: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.__next_prisma__ ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") global.__next_prisma__ = prisma;

type Params = { quizId: string; attemptId: string };

export default async function ReviewAttemptPage(props: any): Promise<React.ReactElement> {
  // Normalize params. This tolerates:
  // - props.params being a plain object
  // - props.params being a Promise that resolves to the object
  const rawParams = await Promise.resolve(props?.params);
  const params = (rawParams ?? {}) as Partial<Params>;
  const { attemptId } = params;

  if (!attemptId) {
    // defensive: invalid route invocation
    return <div className="text-center mt-8">Invalid attempt id.</div>;
  }

  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/unauthorized");
  }

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      student: true,
      quiz: true,
      UserAnswer: { include: { question: true } },
    },
  });

  if (!attempt) {
    return <div className="text-center mt-8">Attempt not found.</div>;
  }

  // Teacher can only grade their own quizzes
  if (session.user.role === "TEACHER" && session.user.id !== attempt.quiz.teacherId) {
    redirect("/unauthorized");
  }

  const questions = await prisma.question.findMany({
    where: { quizId: attempt.quizId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Reviewing {attempt.quiz.title}</h1>
      <h2 className="text-xl text-gray-700 mb-6">Student: {attempt.student.name}</h2>
      {/* TODO: render questions/answers here using `questions` and `attempt.UserAnswer` */}
    </div>
  );
}
