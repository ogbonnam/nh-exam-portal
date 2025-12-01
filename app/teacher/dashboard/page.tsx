// // app/teacher/dashboard/page.tsx
// import React from "react";
// import { auth } from "@/auth";
// import { redirect } from "next/navigation";
// import { PrismaClient } from "@prisma/client";
// import Link from "next/link";
// import { format } from "date-fns";
// import { deleteQuiz, duplicateQuiz } from "@/app/teacher/quizzes/actions";
// import DeleteButton from "@/components/DeleteButton";
// import Filters from "./Filters"; // client filter component
// import BackButton from "@/components/BackButton";

// const globalForPrisma = global as unknown as { prisma: PrismaClient };
// const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ["error"],
//   });
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// const PAGE_size = 6; // quizzes per page
// const PAGE_SIZE = PAGE_size; // keep readable constant

// export default async function TeacherDashboardPage(props: any): Promise<React.ReactElement> {
//   // normalize searchParams (accepts either a plain object or a Promise)
//   const rawSearch = await Promise.resolve(props?.searchParams);
//   const searchParams = (rawSearch ?? {}) as {
//     page?: string;
//     yearGroup?: string;
//     className?: string;
//   };

//   const session = await auth();
//   if (session?.user?.role !== "TEACHER" && session?.user?.role !== "ADMIN") {
//     redirect("/unauthorized");
//   }

//   // parse page safely with radix and fallback
//   const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

//   // use nullish coalescing to keep undefined when not present
//   const yearGroupFilter = searchParams.yearGroup ?? undefined;
//   const classNameFilter = searchParams.className ?? undefined;

//   // Build Prisma where clause
//   const where: any = { teacherId: session?.user?.id };
//   if (yearGroupFilter) where.yearGroup = yearGroupFilter;
//   if (classNameFilter) where.className = classNameFilter;

//   const totalQuizzes = await prisma.quiz.count({ where });
//   const quizzes = await prisma.quiz.findMany({
//     where,
//     orderBy: { createdAt: "desc" },
//     take: PAGE_SIZE,
//     skip: (page - 1) * PAGE_SIZE,
//   });

//   const totalPages = Math.max(1, Math.ceil(totalQuizzes / PAGE_SIZE));

//   // Distinct yearGroups for filters
//   const allQuizzes = await prisma.quiz.findMany({
//     where: { teacherId: session?.user?.id },
//   });
//   const yearGroups = Array.from(new Set(allQuizzes.map((q) => q.yearGroup)));
//   const yearGroupClasses: Record<string, string[]> = {
//     "Year 7": ["Year 7 AMA", "Year 7 SAG"],
//     "Year 8": ["Year 8 CAD", "Year 8 LDK"],
//     "Year 9": ["Year 9 NOI", "Year 9 ZAB"],
//     "Year 10": ["Year 10 MAL", "Year 10 AMU"],
//     "Year 11": ["Year 11 ZAK", "Year 11 LDK"],
//   };

//   return (
//     <div className="container mx-auto p-4 my-12">
//       <div className="flex">

//       <BackButton />
//       <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
//       </div>

//       {/* <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold">My Quizzes</h2>
//         <Link
//           href="/teacher/quizzes/create"
//           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//         >
//           Create New Quiz
//         </Link>
//       </div> */}
//       {/* <div>
//         <Link href={`/teacher/quizzes/upload`}>
//         <button>Upload Quiz</button>
//         </Link>
//       </div> */}
     

//     <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold">My Quizzes</h2>
//         <div className="flex gap-2">
//           <Link
//             href="/teacher/quizzes/create"
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//           >
//             Create New Quiz
//           </Link>
//           <Link
//             href="/teacher/quizzes/upload"
//             className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
//           >
//             Upload Quiz
//           </Link>
//         </div>
//       </div>

//       {/* Client-side filters */}
//       <Filters
//         yearGroups={yearGroups}
//         yearGroupClasses={yearGroupClasses}
//         initialYear={yearGroupFilter}
//         initialClass={classNameFilter}
//       />

//       {/* Quiz List */}
//       {quizzes.length === 0 ? (
//         <p className="text-gray-600">No quizzes found.</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {quizzes.map((quiz) => (
//             <div
//               key={quiz.id}
//               className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between"
//             >
//               <div>
//                 <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
//                 <p className="mt-2 text-gray-600">{quiz.description}</p>
//                 {quiz.startDate && (
//                   <p className="mt-2 text-sm text-gray-500">
//                     <strong>Start Date:</strong> {format(quiz.startDate, "PPP")}
//                   </p>
//                 )}
//                 {quiz.startTime && (
//                   <p className="mt-2 text-sm text-gray-500">
//                     <strong>Start Time:</strong> {format(quiz.startTime, "hh:mm a")}
//                   </p>
//                 )}
//                 <p className="mt-2 text-sm text-gray-500">
//                   <strong>Duration:</strong> {quiz.duration} minutes
//                 </p>
//                 <p className="mt-2 text-sm text-gray-500">
//                   <strong>Year/Class:</strong> {quiz.yearGroup} / {quiz.className}
//                 </p>
//               </div>

//               <div className="mt-4 flex flex-wrap gap-2">
//                 <Link
//                   href={`/admin/quizzes/${quiz.id}`}
//                   className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
//                 >
//                   View Results
//                 </Link>

//                 {quiz.canTeacherEdit && (
//                   <>
//                     <Link
//                       href={`/teacher/quizzes/edit/${quiz.id}`}
//                       className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
//                     >
//                       Edit
//                     </Link>
//                     <form action={deleteQuiz}>
//                       <input type="hidden" name="quizId" value={quiz.id} />
//                       <DeleteButton quizId={quiz.id} />
//                     </form>
//                     <form action={duplicateQuiz}>
//                       <input type="hidden" name="quizId" value={quiz.id} />
//                       <button
//                         type="submit"
//                         className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
//                       >
//                         Duplicate
//                       </button>
//                     </form>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Pagination */}
//       <div className="flex justify-center mt-6 gap-2">
//         {Array.from({ length: totalPages }).map((_, i) => (
//           <Link
//             key={i}
//             href={`?page=${i + 1}&yearGroup=${yearGroupFilter || ""}&className=${classNameFilter || ""}`}
//             className={`px-3 py-1 border rounded-md ${page === i + 1 ? "bg-gray-800 text-white" : "bg-white"}`}
//           >
//             {i + 1}
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

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
import BackButton from "@/components/BackButton";
import QuizActionButtons from "@/components/QuizActionButtons"; // Import the new component

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const PAGE_size = 6; // quizzes per page
const PAGE_SIZE = PAGE_size; // keep readable constant

// Define a type that includes the academic fields
type QuizWithAcademic = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  yearGroup: string;
  className: string;
  title: string;
  description: string | null;
  duration: number;
  teacherId: string;
  isPublished: boolean;
  startDate: Date | null;
  startTime: Date | null;
  canTeacherEdit: boolean;
  academicYear: string;
  term: string;
  subterm: string;
};

export default async function TeacherDashboardPage(props: any): Promise<React.ReactElement> {
  // normalize searchParams (accepts either a plain object or a Promise)
  const rawSearch = await Promise.resolve(props?.searchParams);
  const searchParams = (rawSearch ?? {}) as {
    page?: string;
    yearGroup?: string;
    className?: string;
    academicYear?: string;
    term?: string;
    subterm?: string;
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
  const academicYearFilter = searchParams.academicYear ?? undefined;
  const termFilter = searchParams.term ?? undefined;
  const subtermFilter = searchParams.subterm ?? undefined;

  // Build Prisma where clause
  const where: any = { teacherId: session?.user?.id };
  if (yearGroupFilter) where.yearGroup = yearGroupFilter;
  if (classNameFilter) where.className = classNameFilter;
  if (academicYearFilter) where.academicYear = academicYearFilter;
  if (termFilter) where.term = termFilter;
  if (subtermFilter) where.subterm = subtermFilter;

  const totalQuizzes = await prisma.quiz.count({ where });
  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  }) as QuizWithAcademic[]; // Type assertion here

  const totalPages = Math.max(1, Math.ceil(totalQuizzes / PAGE_SIZE));

  // Distinct values for filters
  const allQuizzes = await prisma.quiz.findMany({
    where: { teacherId: session?.user?.id },
  }) as QuizWithAcademic[]; // Type assertion here
  
  const yearGroups = Array.from(new Set(allQuizzes.map((q) => q.yearGroup)));
  
  // Get academic years and sort them
  const academicYears = Array.from(new Set(allQuizzes.map((q) => q.academicYear).filter(Boolean)));
  academicYears.sort((a, b) => {
    // Extract the starting year from strings like "2023-2024"
    const yearA = parseInt(a.split('-')[0]);
    const yearB = parseInt(b.split('-')[0]);
    return yearA - yearB;
  });
  
  // Get terms and sort them in the order: AUTUMN, SPRING, SUMMER
  const termOrder = ['AUTUMN', 'SPRING', 'SUMMER'];
  const terms = Array.from(new Set(allQuizzes.map((q) => q.term).filter(Boolean)));
  terms.sort((a, b) => termOrder.indexOf(a) - termOrder.indexOf(b));
  
  // Get subterms and sort them in the order: MIDTERM, END_OF_TERM
  const subtermOrder = ['MIDTERM', 'END_OF_TERM'];
  const subterms = Array.from(new Set(allQuizzes.map((q) => q.subterm).filter(Boolean)));
  subterms.sort((a, b) => subtermOrder.indexOf(a) - subtermOrder.indexOf(b));
  
  const yearGroupClasses: Record<string, string[]> = {
    "Year 7": ["Year 7 FAL", "Year 7 MMA"],
    "Year 8": ["Year 8 AMQ", "Year 8 SAG"],
    "Year 9": ["Year 9 AMA", "Year 9 CAD"],
    "Year 10": ["Year 10 NOI", "Year 10 ZAB"],
    "Year 11": ["Year 11 AMU", "Year 11 MAL"],
  };

  return (
    <div className="container mx-auto p-4 my-12">
      <div className="flex">
        <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Quizzes</h2>
        {/* Replace the buttons with our new component */}
        <QuizActionButtons />
      </div>

      {/* Client-side filters */}
      <Filters
        yearGroups={yearGroups}
        yearGroupClasses={yearGroupClasses}
        academicYears={academicYears}
        terms={terms}
        subterms={subterms}
        initialYear={yearGroupFilter}
        initialClass={classNameFilter}
        initialAcademicYear={academicYearFilter}
        initialTerm={termFilter}
        initialSubterm={subtermFilter}
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
                
                {/* Academic Information */}
                <div className="mt-2 text-sm text-gray-500">
                  <p><strong>Academic Year:</strong> {quiz.academicYear}</p>
                  <p><strong>Term:</strong> {quiz.term.charAt(0) + quiz.term.slice(1).toLowerCase()}</p>
                  <p><strong>Subterm:</strong> {quiz.subterm === 'MIDTERM' ? 'Midterm' : 'End of Term'}</p>
                </div>
                
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
                {/* Update the View Results link to point to the teacher results page */}
                <Link
                  href={`/teacher/quizzes/${quiz.id}/results`}
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
            href={`?page=${i + 1}&yearGroup=${yearGroupFilter || ""}&className=${classNameFilter || ""}&academicYear=${academicYearFilter || ""}&term=${termFilter || ""}&subterm=${subtermFilter || ""}`}
            className={`px-3 py-1 border rounded-md ${page === i + 1 ? "bg-gray-800 text-white" : "bg-white"}`}
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}