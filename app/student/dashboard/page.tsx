// app/student/dashboard/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import CountdownBadge from "./CountdownTimer";
import StartButton from "./StartButton";

const prisma = new PrismaClient();
const PAGE_SIZE = 3;

export default async function StudentDashboardPage(props: any): Promise<React.ReactElement> {
  // normalize searchParams (accepts plain object or Promise)
  const rawSearch = await Promise.resolve(props?.searchParams);
  const searchParams = (rawSearch ?? {}) as { page?: string };

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
          We couldn’t determine your year group or class name.
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

  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const totalQuizzes = await prisma.quiz.count({ where });
  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { startDate: "asc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalQuizzes / PAGE_SIZE));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">My Exams</h1>

      {quizzes.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">No available exams.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz) => {
            const startTimeISO = quiz.startDate?.toISOString() ?? null;
            const duration = quiz.duration ?? 60;

            let serverRemainingSeconds: number | null = null;
            let serverStartLabel: string | null = null;
            let serverEndLabel: string | null = null;
            let startTime: Date | null = null;
            let endTime: Date | null = null;

            if (startTimeISO) {
              startTime = new Date(startTimeISO);
              endTime = new Date(startTime.getTime() + duration * 60000);
              serverRemainingSeconds = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
              serverStartLabel = startTime.toLocaleString();
              serverEndLabel = endTime.toLocaleString();
            }

            const now = new Date();
            const hasStarted = startTime ? now >= startTime : false;
            const hasEnded = endTime ? now >= endTime : false;

            return (
              <div
                key={quiz.id}
                className={`relative p-6 rounded-xl shadow-xl flex flex-col justify-between transition-transform transform hover:-translate-y-1 hover:shadow-2xl ${
                  !hasStarted || hasEnded ? "opacity-90 bg-white" : "bg-gradient-to-br from-indigo-400 to-purple-500 text-white"
                }`}
              >
                <CountdownBadge
                  startTimeISO={startTimeISO}
                  duration={duration}
                  serverRemainingSeconds={serverRemainingSeconds}
                  serverStartLabel={serverStartLabel}
                  serverEndLabel={serverEndLabel}
                />

                <div>
                  <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
                  {quiz.description && <p className="mb-2 text-sm md:text-base">{quiz.description}</p>}
                  <p className="text-sm font-medium">
                    <strong>Start:</strong> {startTime ? serverStartLabel : "TBD"}
                  </p>
                  <p className="text-sm font-medium">
                    <strong>End:</strong> {endTime ? serverEndLabel : "TBD"}
                  </p>
                  <p className="text-sm font-medium">
                    <strong>Duration:</strong> {quiz.duration} minutes
                  </p>
                  <p className="text-sm font-medium">
                    <strong>Year/Class:</strong> {quiz.yearGroup} / {quiz.className}
                  </p>
                </div>

                <StartButton quizId={quiz.id} startTimeISO={startTimeISO} duration={duration} />
              </div>
            );
          })}
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
