// app/api/teacher/quizzes/[quizId]/export-results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  const session = await auth();
  
  if (!session || session.user?.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId } = params;

  try {
    // Verify the teacher owns this quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { teacherId: true, title: true }
    });

    if (!quiz || quiz.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all attempts with student data
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
    
    const maxScore = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Format data for CSV export
    const csvData = attempts.map(attempt => {
      const score = attempt.score || 0;
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      return {
        "Student Name": attempt.student?.name || attempt.student?.email || "Unknown",
        "Student Email": attempt.student?.email || "",
        "Score": score,
        "Percentage": `${percentage}%`,
        "Focus Loss Count": attempt.focusLossCount,
        "Submission Date": attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : ""
      };
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          // Escape quotes and handle commas in the data
          const value = row[header as keyof typeof row] || "";
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Create response with CSV file
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${quiz.title.replace(/[^a-z0-9]/gi, '_')}_results.csv"`
      }
    });

    return response;
  } catch (error) {
    console.error("Error exporting results:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}