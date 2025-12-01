// app/api/teacher/quizzes/[quizId]/close-attempt/[attemptId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request, context: any) {
  const session = await auth(); // or await auth(request) if your auth needs the request

  if (!session || session.user?.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId, attemptId } = context.params as { quizId: string; attemptId: string };

  try {
    // Verify the teacher owns this quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { teacherId: true },
    });

    if (!quiz || quiz.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the quiz attempt to close it
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        isSubmitted: true,
        submittedAt: new Date(),
        submissionReason: "Closed by teacher",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quiz attempt closed successfully",
      attempt: updatedAttempt,
    });
  } catch (error) {
    console.error("Error closing quiz attempt:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
