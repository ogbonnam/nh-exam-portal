// app/teacher/quizzes/edit/[quizId]/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import EditQuizForm from "@/app/teacher/quizzes/edit/EditQuizForm";

declare global {
  // single PrismaClient instance in dev to avoid too many connections
  // eslint-disable-next-line no-var
  var __next_prisma__: PrismaClient | undefined;
}
const prisma: PrismaClient =
  global.__next_prisma__ ?? new PrismaClient({ log: ["error"] });
if (process.env.NODE_ENV !== "production") global.__next_prisma__ = prisma;

export default async function EditQuizPage(props: any): Promise<React.ReactElement | null> {
  // Normalize params (accepts either a plain object or a Promise)
  const rawParams = await Promise.resolve(props?.params);
  const params = (rawParams ?? {}) as { quizId?: string };
  const quizId = params.quizId;
  if (!quizId) {
    // missing id -> redirect back to dashboard
    redirect("/teacher/dashboard");
    return null;
  }

  const session = await auth();
  const user = session?.user;

  // Initial auth check
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    redirect("/unauthorized");
    return null;
  }

  // Fetch the quiz
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { options: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Authorization: admin can edit any, teacher only their own
  if (!quiz || (user.role === "TEACHER" && quiz.teacherId !== user.id)) {
    redirect("/unauthorized");
    return null;
  }

  // If quiz is locked for teachers, redirect
  if (!quiz.canTeacherEdit && user.role === "TEACHER") {
    redirect("/teacher/dashboard");
    return null;
  }

  // Combine date/time fields if necessary (kept as-is here)
  const quizWithCombinedDateTime = {
    ...quiz,
    startDate: quiz.startDate,
    startTime: quiz.startTime,
  };

  return <EditQuizForm quiz={quizWithCombinedDateTime} />;
}
