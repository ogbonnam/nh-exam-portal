"use server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function toggleQuizLock(formData: FormData): Promise<void> {
  const session = await auth();
  const user = session?.user;

  if (!user || user.role !== "ADMIN") {
    console.error("Unauthorized action attempt");
    return;
  }

  const quizId = formData.get("quizId") as string;
  const canTeacherEdit = formData.get("canTeacherEdit") === "true";

  if (!quizId) {
    console.error("Quiz ID missing from form data.");
    return;
  }

  try {
    await prisma.quiz.update({
      where: { id: quizId },
      data: { canTeacherEdit: !canTeacherEdit },
    });

    revalidatePath("/admin/quizzes");
    revalidatePath("/teacher/dashboard");
  } catch (error) {
    console.error(`Failed to update quiz ${quizId}:`, error);
  }
}

export async function toggleQuizPublished(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    console.error("Unauthorized access");
    return;
  }

  const quizId = formData.get("quizId") as string;
  const isPublished = formData.get("isPublished") === "true";

  if (!quizId) {
    console.error("Quiz ID is missing");
    return;
  }

  try {
    await prisma.quiz.update({
      where: { id: quizId },
      data: { isPublished: !isPublished },
    });
    revalidatePath("/admin/quizzes", "page"); // Force a full page revalidation
    revalidatePath("/teacher/dashboard");
  } catch (error) {
    console.error("Failed to toggle publish status:", error);
    return;
  }
}
