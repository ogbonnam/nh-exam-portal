import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import PublishQuizButton from "@/components/PublishQuizButton";
import LockQuizButton from "@/components/LockQuizButton";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const PAGE_SIZE = 6; // quizzes per page

export default async function AdminQuizzesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    teacherId?: string;
    yearGroup?: string;
    className?: string;
  };
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const page = parseInt(searchParams.page || "1");
  const teacherFilter = searchParams.teacherId || undefined;
  const yearGroupFilter = searchParams.yearGroup || undefined;
  const classNameFilter = searchParams.className || undefined;

  const where: any = {};
  if (teacherFilter) where.teacherId = teacherFilter;
  if (yearGroupFilter) where.yearGroup = yearGroupFilter;
  if (classNameFilter) where.className = classNameFilter;

  const totalQuizzes = await prisma.quiz.count({ where });
  const quizzes = await prisma.quiz.findMany({
    where,
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });
  const totalPages = Math.ceil(totalQuizzes / PAGE_SIZE);

  // Fetch distinct teacherIds, yearGroups and classNames for filters
  const allQuizzes = await prisma.quiz.findMany({ include: { teacher: true } });
  const teachers = Array.from(
    new Map(allQuizzes.map((q) => [q.teacherId, q.teacher])).values()
  );
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
      <h1 className="text-3xl font-bold mb-6">All Quizzes</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <form method="GET" className="flex gap-2 items-center flex-wrap">
          <label>Teacher:</label>
          <select name="teacherId" defaultValue={teacherFilter || ""}>
            <option value="">All</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || t.email}
              </option>
            ))}
          </select>

          <label>Year Group:</label>
          <select name="yearGroup" defaultValue={yearGroupFilter || ""}>
            <option value="">All</option>
            {yearGroups.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <label>Class Name:</label>
          <select name="className" defaultValue={classNameFilter || ""}>
            <option value="">All</option>
            {(yearGroupFilter
              ? yearGroupClasses[yearGroupFilter] || []
              : []
            ).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700"
          >
            Filter
          </button>

          <a
            href="/admin/quizzes"
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
          >
            Clear
          </a>
        </form>
      </div>

      {/* Quizzes Grid */}
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
                <h3 className="text-xl font-bold text-gray-800">
                  {quiz.title}
                </h3>
                <p className="mt-2 text-gray-600">
                  Created by: {quiz.teacher?.name || quiz.teacher?.email}
                </p>
                {quiz.description && (
                  <p className="mt-2 text-gray-600">{quiz.description}</p>
                )}
                {quiz.startDate && (
                  <p className="mt-2 text-sm text-gray-500">
                    <strong>Start Date:</strong> {format(quiz.startDate, "PPP")}
                  </p>
                )}
                {quiz.startTime && (
                  <p className="mt-2 text-sm text-gray-500">
                    <strong>Start Time:</strong>{" "}
                    {format(quiz.startTime, "hh:mm a")}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Duration:</strong> {quiz.duration} minutes
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Year/Class:</strong> {quiz.yearGroup} /{" "}
                  {quiz.className}
                </p>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    quiz.isPublished ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Status: {quiz.isPublished ? "Published" : "Draft"}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/quizzes/${quiz.id}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  View Results
                </Link>

                <PublishQuizButton
                  quizId={quiz.id}
                  isPublished={quiz.isPublished}
                />
                <LockQuizButton
                  quizId={quiz.id}
                  canTeacherEdit={quiz.canTeacherEdit}
                />

                <Link
                  href={`/teacher/quizzes/edit/${quiz.id}`}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </Link>
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
            href={`?page=${i + 1}&teacherId=${teacherFilter || ""}&yearGroup=${
              yearGroupFilter || ""
            }&className=${classNameFilter || ""}`}
            className={`px-3 py-1 border rounded-md ${
              page === i + 1 ? "bg-gray-800 text-white" : "bg-white"
            }`}
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}
