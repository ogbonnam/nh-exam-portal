// app/teacher/dashboard/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import { deleteQuiz, duplicateQuiz } from "@/app/teacher/quizzes/actions";
import DeleteButton from "@/components/DeleteButton";
import Filters from "./Filters"; // client filter component

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const PAGE_size = 6; // quizzes per page
const PAGE_SIZE = PAGE_size; // keep readable constant

export default async function TeacherDashboardPage(props: any): Promise<React.ReactElement> {
  // normalize searchParams (accepts either a plain object or a Promise)
  const rawSearch = await Promise.resolve(props?.searchParams);
  const searchParams = (rawSearch ?? {}) as {
    page?: string;
    yearGroup?: string;
    className?: string;
  };

  const session = await auth();
  if (session?.user?.role !== "TEACHER" && session?.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // parse page safely with radix and fallback
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  // use nullish coalescing to keep undefined when not present
  const yearGroupFilter = searchParams.yearGroup ?? undefined;
  const classNameFilter = searchParams.className ?? undefined;

  // Build Prisma where clause
  const where: any = { teacherId: session?.user?.id };
  if (yearGroupFilter) where.yearGroup = yearGroupFilter;
  if (classNameFilter) where.className = classNameFilter;

  const totalQuizzes = await prisma.quiz.count({ where });
  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalQuizzes / PAGE_SIZE));

  // Distinct yearGroups for filters
  const allQuizzes = await prisma.quiz.findMany({
    where: { teacherId: session?.user?.id },
  });
  const yearGroups = Array.from(new Set(allQuizzes.map((q) => q.yearGroup)));
  const yearGroupClasses: Record<string, string[]> = {
    "Year 7": ["Year 7 AMA", "Year 7 SAG"],
    "Year 8": ["Year 8 CAD", "Year 8 LDK"],
    "Year 9": ["Year 9 NOI", "Year 9 ZAB"],
    "Year 10": ["Year 10 MAL"],
    "Year 11": ["Year 11 ZAK", "Year 11 LDK"],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Quizzes</h2>
        <Link
          href="/teacher/quizzes/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create New Quiz
        </Link>
      </div>

      {/* Client-side filters */}
      <Filters
        yearGroups={yearGroups}
        yearGroupClasses={yearGroupClasses}
        initialYear={yearGroupFilter}
        initialClass={classNameFilter}
      />

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <p className="text-gray-600">No quizzes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
                <p className="mt-2 text-gray-600">{quiz.description}</p>
                {quiz.startDate && (
                  <p className="mt-2 text-sm text-gray-500">
                    <strong>Start Date:</strong> {format(quiz.startDate, "PPP")}
                  </p>
                )}
                {quiz.startTime && (
                  <p className="mt-2 text-sm text-gray-500">
                    <strong>Start Time:</strong> {format(quiz.startTime, "hh:mm a")}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Duration:</strong> {quiz.duration} minutes
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Year/Class:</strong> {quiz.yearGroup} / {quiz.className}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/quizzes/${quiz.id}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  View Results
                </Link>

                {quiz.canTeacherEdit && (
                  <>
                    <Link
                      href={`/teacher/quizzes/edit/${quiz.id}`}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                    <form action={deleteQuiz}>
                      <input type="hidden" name="quizId" value={quiz.id} />
                      <DeleteButton quizId={quiz.id} />
                    </form>
                    <form action={duplicateQuiz}>
                      <input type="hidden" name="quizId" value={quiz.id} />
                      <button
                        type="submit"
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                      >
                        Duplicate
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <Link
            key={i}
            href={`?page=${i + 1}&yearGroup=${yearGroupFilter || ""}&className=${classNameFilter || ""}`}
            className={`px-3 py-1 border rounded-md ${page === i + 1 ? "bg-gray-800 text-white" : "bg-white"}`}
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}
