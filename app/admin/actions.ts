"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient, UserAnswer } from "@prisma/client";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function checkAdminRole() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }
}

export async function createUser(formData: FormData) {
  await checkAdminRole();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const roleName = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !roleName || !password) {
    return { error: "All fields are required." };
  }

  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      return { error: "Role not found." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
      },
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: "Failed to create user. Email may already be in use." };
  }
}

// New action for updating manual scores
export async function updateManualScore(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
    redirect("/unauthorized");
  }

  const attemptId = formData.get("attemptId") as string;
  const questionId = formData.get("questionId") as string;
  const pointsAwarded = parseInt(formData.get("points") as string, 10);

  if (isNaN(pointsAwarded)) {
    return { error: "Points must be a number." };
  }

  try {
    // Find the question to get its maximum points
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return { error: "Question not found." };
    }

    if (pointsAwarded > question.points || pointsAwarded < 0) {
      return { error: `Points must be between 0 and ${question.points}.` };
    }

    // Find and update the specific UserAnswer for this question and attempt
    const userAnswer = await prisma.userAnswer.findFirst({
      where: {
        attemptId: attemptId,
        questionId: questionId,
      },
    });

    if (!userAnswer) {
      return { error: "User answer not found." };
    }

    // Update the answer's score status
    await prisma.userAnswer.update({
      where: { id: userAnswer.id },
      data: {
        isCorrect: pointsAwarded > 0,
      },
    });

    // Recalculate the total score for the attempt
    const allAnswers = await prisma.userAnswer.findMany({
      where: { attemptId },
      include: { question: true }, // ✅ Ensures `ans.question` exists
    });

    const newScore = allAnswers.reduce((sum, ans) => {
      if (ans.isCorrect && ans.question) {
        return sum + ans.question.points;
      }
      return sum;
    }, 0);

    // Update the final score on the quiz attempt
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score: newScore,
      },
    });

    revalidatePath(
      `/admin/quizzes/${allAnswers[0]?.question.quizId}/attempt/${attemptId}`
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update score:", error);
    return { error: "Failed to update score. An error occurred." };
  }
}
