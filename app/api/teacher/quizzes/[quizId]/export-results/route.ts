// app/api/teacher/quizzes/[quizId]/export-results/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, context: any) {
  const session = await auth(); // or await auth(request) if auth reads cookies/headers

  if (!session || session.user?.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId } = (context.params as { quizId: string }) || {};

  try {
    // Verify the teacher owns this quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { teacherId: true, title: true }
    });

    if (!quiz || quiz.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all submitted attempts with student info
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        isSubmitted: true
      },
      include: {
        student: {
          select: { name: true, email: true }
        }
      },
      orderBy: { submittedAt: "desc" }
    });

    // Calculate max score
    const questions = await prisma.question.findMany({
      where: { quizId },
      select: { points: true }
    });

    const maxScore = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);

    // Prepare CSV rows
    const csvData = attempts.map(attempt => {
      const score = attempt.score ?? 0;
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      return {
        "Student Name": attempt.student?.name ?? attempt.student?.email ?? "Unknown",
        "Student Email": attempt.student?.email ?? "",
        "Score": String(score),
        "Percentage": `${percentage}%`,
        "Focus Loss Count": String(attempt.focusLossCount ?? 0),
        "Submission Date": attempt.submittedAt ? new Date(attempt.submittedAt).toISOString() : ""
      };
    });

    // If there are no rows, return an empty CSV with headers
    const headers = ["Student Name", "Student Email", "Score", "Percentage", "Focus Loss Count", "Submission Date"];
    const csvRows = csvData.length
      ? csvData.map(row => headers.map(h => {
          const raw = row[h as keyof typeof row] ?? "";
          const str = String(raw);
          // escape quotes and wrap if contains comma or newline
          if (str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          if (str.includes(',') || str.includes('\n')) {
            return `"${str}"`;
          }
          return str;
        }).join(','))
      : [];

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const filenameSafe = (quiz.title ?? "quiz_results").replace(/[^a-z0-9]/gi, '_');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameSafe}_results.csv"`
      }
    });
  } catch (error) {
    console.error("Error exporting results:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
