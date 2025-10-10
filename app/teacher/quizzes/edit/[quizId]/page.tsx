// app/teacher/quizzes/edit/[quizId]/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import EditQuizForm from "@/app/teacher/quizzes/edit/EditQuizForm";

const prisma = new PrismaClient(); // consider replacing with a singleton from lib/prisma.ts in the long run

interface EditQuizPageProps {
  params: {
    quizId?: string;
  };
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  // Await the proxied params before using.
  const p = await params;
  const quizId = p?.quizId;
  if (!quizId) {
    // missing id -> show 404 or redirect as appropriate
    redirect("/teacher/dashboard");
    return null;
  }

  const session = await auth();
  const user = session?.user;

  // Initial check for a valid user and correct role
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    redirect("/unauthorized");
  }

  // Fetch the quiz by its ID. Use the awaited quizId variable.
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      questions: {
        include: {
          options: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  // Now, perform the authorization check after the quiz has been fetched.
  // Admins can edit any quiz. Teachers can only edit their own.
  if (!quiz || (user.role === "TEACHER" && quiz.teacherId !== user.id)) {
    redirect("/unauthorized");
  }

  // 🚨 If quiz is locked for teachers, kick them back
  if (!quiz.canTeacherEdit) {
    redirect("/teacher/dashboard");
  }

  // Handle a case where the quiz start time and date were stored separately
  // and need to be combined for the form.
  const quizWithCombinedDateTime = {
    ...quiz,
    startDate: quiz.startDate,
    startTime: quiz.startTime,
  };

  return <EditQuizForm quiz={quizWithCombinedDateTime} />;
}
