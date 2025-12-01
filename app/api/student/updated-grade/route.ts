// app/api/student/updated-grade/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user?.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate that attemptId and manualScores are present
    if (!body.attemptId) {
      return NextResponse.json({ 
        error: "Missing required field: attemptId is required" 
      }, { status: 400 });
    }

    if (!body.manualScores || typeof body.manualScores !== 'object') {
      return NextResponse.json({ 
        error: "Missing required field: manualScores is required and must be an object" 
      }, { status: 400 });
    }

    const { attemptId, manualScores } = body;

    // Type assertion for manualScores
    const scores = manualScores as Record<string, number>;

    // Verify the attempt exists and belongs to a quiz owned by this teacher
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: { teacherId: true }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: "Quiz attempt not found" }, { status: 404 });
    }

    if (attempt.quiz.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update each user answer with the manual score
    for (const [questionId, score] of Object.entries(scores)) {
      await prisma.userAnswer.updateMany({
        where: {
          attemptId,
          questionId,
        },
        data: {
          isCorrect: score > 0,
        },
      });
    }
    
    // Calculate and update the total score with proper typing
    const totalScore = Object.values(scores).reduce(
      (sum: number, score: number) => sum + score, 
      0
    );
    
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { score: totalScore },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving grades:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}