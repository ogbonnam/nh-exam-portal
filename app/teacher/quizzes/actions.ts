// app/teacher/quizzes/actions.ts
"use server";
import { PrismaClient, QuestionType } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
const prisma = new PrismaClient();

interface QuizFormState {
  error?: string;
  success?: boolean;
}

interface FetchQuizzesOptions {
  teacherId: string;
  yearGroup?: string;
  className?: string;
  page?: number;
  pageSize?: number;
}

// export async function createQuiz(formData: FormData) {
//   const session = await auth();
//   if (session?.user?.role !== "TEACHER") {
//     redirect("/unauthorized");
//   }

//   const title = formData.get("title") as string;
//   const description = formData.get("description") as string;
//   const duration = parseInt(formData.get("duration") as string, 10);
//   const startDateStr = formData.get("startDate") as string;
//   const startTimeStr = formData.get("startTime") as string;

//   const startDate = startDateStr
//     ? new Date(`${startDateStr}T${startTimeStr}`)
//     : undefined;

//   const questionsData = JSON.parse(formData.get("questions") as string);

//   try {
//     await prisma.quiz.create({
//       data: {
//         title,
//         description,
//         duration,
//         startDate,
//         teacherId: session.user.id!,
//         questions: {
//           create: questionsData.map((q: any) => ({
//             questionText: q.questionText,
//             points: parseInt(q.points, 10),
//             type: q.type as QuestionType,
//             correctAnswer: q.correctAnswer,
//             options: {
//               create: q.options.map((o: any) => ({
//                 text: o.text,
//                 imageUrl: o.imageUrl,
//                 isCorrect: o.isCorrect,
//               })),
//             },
//           })),
//         },
//       },
//     });

//     // revalidatePath("/teacher/dashboard");
//     redirect("/teacher/dashboard");
//   } catch (error) {
//     console.error("Failed to create quiz:", error);
//     return { error: "Failed to create quiz." };
//   }
// }
function parseLocalTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  // Construct as local time (no timezone offset applied)
  return new Date(1970, 0, 1, hours, minutes);
}

export async function createQuiz(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const duration = parseInt(formData.get("duration") as string, 10);

  const startDateStr = formData.get("startDate") as string | null;
  const startTimeStr = formData.get("startTime") as string | null;

  const startDate = startDateStr ? new Date(startDateStr) : null;

  // store time as 1970-01-01 + hh:mm, so it's independent of the quiz date
  // const startTime = startTimeStr
  //   ? new Date(`1970-01-01T${startTimeStr}:00Z`)
  //   : null;
  const startTime = startTimeStr ? parseLocalTime(startTimeStr) : null;

  // ✅ new: grab yearGroup and className
  const yearGroup = formData.get("yearGroup") as string;
  const className = formData.get("className") as string;

  const questionsData = JSON.parse(formData.get("questions") as string);

  try {
    await prisma.quiz.create({
      data: {
        title,
        description,
        duration,
        startDate,
        startTime,
        teacherId: session.user.id!,
        yearGroup, // ✅ save to DB
        className, // ✅ save to DB
        questions: {
          create: questionsData.map((q: any) => ({
            text: q.text,
            imageUrl: q.imageUrl || null,
            points: q.points || 1,
            type: q.type as QuestionType,
            correctAnswer: q.correctAnswer || null,
            options: {
              create: q.options.map((o: any) => ({
                text: o.text,
                imageUrl: o.imageUrl || null,
                isCorrect: o.isCorrect,
              })),
            },
          })),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return { error: "Failed to create quiz." };
  }
}

export async function deleteQuiz(formData: FormData) {
  const session = await auth();
  const quizId = formData.get("quizId") as string;
  const user = session?.user;

  // The corrected authorization check
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    console.error("Unauthorized deletion attempt.");
    return;
  }

  try {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        teacherId: user.id,
      },
    });

    if (!quiz) {
      console.error(
        "Quiz not found or you do not have permission to delete it."
      );
      return;
    }

    if (!quiz.canTeacherEdit) {
      console.error("This quiz cannot be deleted.");
      return;
    }

    // Use a transaction to delete all nested data and the quiz itself
    await prisma.$transaction([
      // 1. Delete all QuizAttempt records. This will cascade to delete all UserAnswers.
      prisma.quizAttempt.deleteMany({
        where: {
          quizId: quizId,
        },
      }),

      // 2. Delete all Question records. This will cascade to delete all Options.
      prisma.question.deleteMany({
        where: {
          quizId: quizId,
        },
      }),

      // 3. Delete the quiz itself.
      prisma.quiz.delete({
        where: { id: quizId },
      }),
    ]);
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return;
  }

  redirect("/teacher/dashboard");
}

// New function to update a quiz
export async function updateQuiz(formData: FormData): Promise<void> {
  const session = await auth();
  const user = session?.user;
  const quizId = String(formData.get("quizId") ?? "");

  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    redirect("/unauthorized");
  }

  if (!quizId) {
    redirect("/teacher/dashboard");
  }

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

    if (!quiz) {
      redirect("/teacher/dashboard");
    }

    if (user.role === "TEACHER" && quiz.teacherId !== user.id) {
      redirect("/unauthorized");
    }

    if (!quiz.canTeacherEdit && user.role !== "ADMIN") {
      redirect("/teacher/dashboard");
    }

    const title = String(formData.get("title") ?? quiz.title ?? "");
    const description = String(formData.get("description") ?? quiz.description ?? "");
    const duration = Number(formData.get("duration") ?? quiz.duration ?? 60);

    const startDateTimeStr = String(formData.get("startDateTime") ?? "");
    const combinedDateTime = startDateTimeStr ? new Date(startDateTimeStr) : null;

    const yearGroup = String(formData.get("yearGroup") ?? quiz.yearGroup ?? "");
    const className = String(formData.get("className") ?? quiz.className ?? "");

    const questionsData = JSON.parse(String(formData.get("questions") ?? "[]"));

    // Load current questions to detect deletes
    const currentQuestions = await prisma.question.findMany({
      where: { quizId },
      select: { id: true },
    });
    const currentQuestionIds = currentQuestions.map((q) => q.id);
    const updatedQuestionIds = questionsData.map((q: any) => q.id).filter(Boolean);
    const questionsToDelete = currentQuestionIds.filter((id) => !updatedQuestionIds.includes(id));

    // Build operations
    const ops: any[] = [];

    ops.push(
      prisma.quiz.update({
        where: { id: quizId },
        data: {
          title,
          description,
          duration,
          startDate: combinedDateTime,
          startTime: combinedDateTime,
          yearGroup: yearGroup || undefined,
          className: className || undefined,
        },
      })
    );

    if (questionsToDelete.length) {
      ops.push(
        prisma.question.deleteMany({
          where: { id: { in: questionsToDelete } },
        })
      );
    }

    for (const q of questionsData) {
      if (q.id) {
        ops.push(
          prisma.question.update({
            where: { id: q.id },
            data: {
              text: q.text,
              imageUrl: q.imageUrl ?? null,
              points: q.points ?? 1,
              type: q.type,
              correctAnswer: q.correctAnswer ?? null,
              options: {
                deleteMany: {},
                create: (q.options ?? []).map((o: any) => ({
                  text: o.text,
                  imageUrl: o.imageUrl ?? null,
                  isCorrect: !!o.isCorrect,
                })),
              },
            },
          })
        );
      } else {
        ops.push(
          prisma.question.create({
            data: {
              text: q.text,
              imageUrl: q.imageUrl ?? null,
              points: q.points ?? 1,
              type: q.type,
              correctAnswer: q.correctAnswer ?? null,
              quiz: { connect: { id: quizId } },
              options: {
                create: (q.options ?? []).map((o: any) => ({
                  text: o.text,
                  imageUrl: o.imageUrl ?? null,
                  isCorrect: !!o.isCorrect,
                })),
              },
            },
          })
        );
      }
    }

    await prisma.$transaction(ops);
  } catch (err: any) {
    // Real errors only — log + rethrow so Next shows an error (or redirect to an error page)
    console.error("Failed to update quiz:", err);
    // You can redirect to an error page instead of throwing:
    // redirect(`/teacher/quizzes/edit/${quizId}?error=update_failed`);
    throw err;
  }

  // perform redirect outside the try/catch so we don't accidentally catch Next's control-flow exception
  redirect("/teacher/dashboard");
}


export async function duplicateQuiz(formData: FormData) {
  "use server";

  const quizId = formData.get("quizId") as string;
  if (!quizId) throw new Error("Quiz ID is required");

  const originalQuiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: true } } },
  });

  if (!originalQuiz) throw new Error("Quiz not found");

  await prisma.quiz.create({
    data: {
      title: `${originalQuiz.title} (Copy)`,
      description: originalQuiz.description,
      duration: originalQuiz.duration,
      teacherId: originalQuiz.teacherId,
      startDate: originalQuiz.startDate,
      startTime: originalQuiz.startTime,
      isPublished: false,
      canTeacherEdit: true,
      yearGroup: originalQuiz.yearGroup,
      className: originalQuiz.className,
      questions: {
        create: originalQuiz.questions.map((q) => ({
          text: q.text,
          imageUrl: q.imageUrl,
          type: q.type,
          points: q.points,
          correctAnswer: q.correctAnswer,
          options: {
            create: q.options.map((o) => ({
              text: o.text,
              imageUrl: o.imageUrl,
              isCorrect: o.isCorrect,
            })),
          },
        })),
      },
    },
  });

  // Optional: revalidate dashboard after duplication
  revalidatePath("/teacher/dashboard");
}

export async function fetchTeacherQuizzes({
  teacherId,
  yearGroup,
  className,
  page = 1,
  pageSize = 10,
}: FetchQuizzesOptions) {
  const where: any = { teacherId };

  if (yearGroup) where.yearGroup = yearGroup;
  if (className) where.className = className;

  const total = await prisma.quiz.count({ where });

  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { quizzes, total };
}
