// app/api/teacher/quizzes/[quizId]/reopen-attempt/[attemptId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { quizId: string; attemptId: string } }
) {
  const session = await auth();

  if (!session || session.user?.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId, attemptId } = params;

  try {
    // Verify the teacher owns this quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { teacherId: true },
    });

    if (!quiz || quiz.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the quiz attempt to reopen it
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        isSubmitted: false,
        submittedAt: null,
        submissionReason: "Reopened by teacher",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quiz attempt reopened successfully",
      attempt: updatedAttempt,
    });
  } catch (error) {
    console.error("Error reopening quiz attempt:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
