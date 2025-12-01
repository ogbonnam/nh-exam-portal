// app/student/dashboard/page.tsx
import React, { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import QuizCard from "./QuizCard";
import Loading from "./loading";

const prisma = new PrismaClient();
const PAGE_SIZE = 3;

async function StudentDashboardContent({ searchParams }: { searchParams?: { page?: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  // --- Fetch the canonical user record from the DB ---
  const userIdentifier = (session.user as any).id ?? session.user.email;
  const dbUser =
    userIdentifier && (session.user as any).id
      ? await prisma.user.findUnique({ where: { id: (session.user as any).id } })
      : session.user.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

  // Use DB values if present; fall back to session user if necessary
  const studentYear = (dbUser?.yearGroup ?? (session.user as any).yearGroup)?.toString().trim();
  const studentClass = (dbUser?.className ?? (session.user as any).className)?.toString().trim();

  if (!studentYear || !studentClass) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">My Exams</h1>
        <p className="text-gray-700">
          We couldn't determine your year group or class name.
          Please contact your administrator to update your student profile.
        </p>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            <strong>Debug info (server):</strong>
          </p>
          <pre className="whitespace-pre-wrap">
            {`session.user: ${JSON.stringify(session.user)}
dbUser: ${JSON.stringify(dbUser)}`}
          </pre>
        </div>
      </div>
    );
  }

  // --- Query quizzes filtered by both yearGroup and className ---
  const where = {
    isPublished: true,
    yearGroup: studentYear,
    className: studentClass,
  };

  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const totalQuizzes = await prisma.quiz.count({ where });
  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { startDate: "asc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  // Fetch quiz attempts for the current user
  const userId = dbUser?.id;
  const attempts = userId ? await prisma.quizAttempt.findMany({
    where: {
      studentId: userId,
      quizId: { in: quizzes.map(q => q.id) }
    }
  }) : [];

  // Create a map of quizId to submission status
  const submissionStatusMap: Record<string, "not_submitted" | "submitted_by_user" | "submitted_by_system"> = {};
  
  // Initialize all quizzes as not submitted
  quizzes.forEach(quiz => {
    submissionStatusMap[quiz.id] = "not_submitted";
  });

  // Update status for quizzes with attempts
  attempts.forEach((attempt: any) => {
    // Only consider submitted attempts
    if (attempt.isSubmitted) {
      // Determine if submission was by user or system
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      if (quiz && quiz.startDate) {
        const endTime = new Date(new Date(quiz.startDate).getTime() + quiz.duration * 60000);
        const submittedAt = attempt.submittedAt ? new Date(attempt.submittedAt) : null;
        
        // If submittedAt is null, we can't determine, so default to system
        if (!submittedAt) {
          submissionStatusMap[attempt.quizId] = "submitted_by_system";
          return;
        }
        
        // Check if we have a submissionReason field
        if (attempt.submissionReason === "TIME_EXPIRED") {
          submissionStatusMap[attempt.quizId] = "submitted_by_system";
        } else if (attempt.submissionReason === "USER_SUBMITTED") {
          submissionStatusMap[attempt.quizId] = "submitted_by_user";
        } else {
          // Fallback: compare submission time with quiz end time
          if (submittedAt < endTime) {
            submissionStatusMap[attempt.quizId] = "submitted_by_user";
          } else {
            submissionStatusMap[attempt.quizId] = "submitted_by_system";
          }
        }
      }
    }
  });

  const totalPages = Math.max(1, Math.ceil(totalQuizzes / PAGE_SIZE));

  return (
    <div className="container mx-auto p-6 my-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">My Exams</h1>

      {quizzes.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">No available exams.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz) => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              submissionStatus={submissionStatusMap[quiz.id]} 
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`?page=${i + 1}`}
              className={`px-4 py-2 rounded-md border font-semibold ${page === i + 1 ? "bg-indigo-500 text-white" : "bg-white text-gray-700 hover:bg-indigo-100"}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function StudentDashboardPage(props: any): Promise<React.ReactElement> {
  // normalize searchParams (accepts plain object or Promise)
  const rawSearch = await Promise.resolve(props?.searchParams);
  const searchParams = (rawSearch ?? {}) as { page?: string };

  return (
    <Suspense fallback={<Loading />}>
      <StudentDashboardContent searchParams={searchParams} />
    </Suspense>
  );
}