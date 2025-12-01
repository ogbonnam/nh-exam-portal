// app/teacher/quizzes/actions.ts
"use server";
import { PrismaClient, QuestionType } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as mammoth from "mammoth";
import { randomUUID } from "crypto";
import { Packer, Document, Paragraph, Media } from "docx";
import JSZip from "jszip";
import { readFileSync } from "fs";


declare global {
  var __prisma__: PrismaClient | undefined;
}
const prisma: PrismaClient = global.__prisma__ ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma__ = prisma;

async function checkAdminOrTeacher() {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user?.role || "")) {
    redirect("/unauthorized");
  }
}

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
// Types
interface Option {
  id: string;
  text: string;
  imageUrl: string | null;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  imageUrl: string | null;
  type: "OPTIONS" | "CHECKBOX" | "PARAGRAPH" | "FILL_IN_THE_BLANK";
  points: number;
  correctAnswer: string;
  options: Option[];
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
  
  // ✅ Add these lines to get academic fields
  const academicYear = formData.get("academicYear") as string;
  const term = formData.get("term") as string;
  const subterm = formData.get("subterm") as string;

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
        academicYear, // ✅ Add this
        term,         // ✅ Add this
        subterm,      // ✅ Add this
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
    
    // Add these lines to get academic fields
    const academicYear = String(formData.get("academicYear") ?? quiz.academicYear ?? "");
    const term = String(formData.get("term") ?? quiz.term ?? "");
    const subterm = String(formData.get("subterm") ?? quiz.subterm ?? "");

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
          academicYear: academicYear || undefined, // Add this
          term: term || undefined,                 // Add this
          subterm: subterm || undefined,          // Add this
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
      academicYear: originalQuiz.academicYear, // Add this
      term: originalQuiz.term,                 // Add this
      subterm: originalQuiz.subterm,          // Add this
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


// Upload and parse DOCX
export async function uploadQuizDocxWithImages(formData: FormData) {
  await checkAdminOrTeacher();

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file uploaded");

  const buffer = await file.arrayBuffer();
  const zip = await import("jszip").then((m) => m.loadAsync(buffer));

  let text = "";
  try {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    text = result?.value ?? "";
  } catch (err) {
    console.warn("Failed to extract text from DOCX:", err);
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Load images from the DOCX media folder
  const imagesMap: Record<string, string> = {};
  zip.folder("word/media")?.forEach(async (relativePath, file) => {
    const data = await file.async("base64");
    imagesMap[relativePath] = `data:image/png;base64,${data}`;
  });

  const questions: Question[] = [];
  let current: Partial<Question> = {};
  let options: Option[] = [];
  let optionIndex = 0;

  for (const line of lines) {
    if (/^Q\d+:/.test(line)) {
      if (current.text) {
        current.options = options;
        questions.push(current as Question);
      }
      current = {
        id: crypto.randomUUID(),
        text: line.split(":")[1].trim(),
        points: 1,
        type: "OPTIONS",
        options: [],
        correctAnswer: "",
      };
      options = [];
      optionIndex = 0;
    } else if (/^Type:/.test(line)) {
      const typeStr = line.split(":")[1].trim().toUpperCase();
      if (["OPTIONS", "CHECKBOX", "PARAGRAPH", "FILL_IN_THE_BLANK"].includes(typeStr))
        current.type = typeStr as QuestionType;
    } else if (/^Points:/.test(line)) {
      current.points = parseInt(line.split(":")[1].trim(), 10) || 1;
    } else if (/^Option [A-Z]:/.test(line)) {
      const match = line.match(/^Option ([A-Z]): (.*)/);
      if (match) {
        const [_full, label, optionText] = match;
        const imageName = `option${label}${questions.length + 1}.png`;
        const imageUrl = imagesMap[imageName] ?? null;

        options.push({
          id: crypto.randomUUID(),
          text: optionText,
          imageUrl,
          isCorrect: false,
        });
        optionIndex++;
      }
    } else if (/^Correct:/.test(line)) {
      const correctLabels = line
        .split(":")[1]
        .trim()
        .split(",")
        .map((s) => s.trim());
      options.forEach((o: Option, i: number) => {
        const label = String.fromCharCode(65 + i);
        if (correctLabels.includes(label)) o.isCorrect = true;
      });
      current.correctAnswer =
        current.type === "CHECKBOX" ? correctLabels.join(",") : correctLabels[0];
    } else if (/^Answer:/.test(line)) {
      current.correctAnswer = line.split(":")[1].trim();
    }
  }

  if (current.text) {
    current.options = options;
    questions.push(current as Question);
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const yearGroup = formData.get("yearGroup") as string;
  const className = formData.get("className") as string;
  const duration = Number(formData.get("duration") ?? 60);
  const startDateStr = formData.get("startDate") as string | null;
  const startTimeStr = formData.get("startTime") as string | null;
  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const startTime =
    startTimeStr && startDateStr ? new Date(`${startDateStr}T${startTimeStr}`) : undefined;

  const teacherId = (await auth())?.user?.id!;

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      yearGroup,
      className,
      duration,
      startDate,
      startTime,
      teacherId,
      questions: {
        create: questions.map((q) => ({
          text: q.text,
          type: q.type,
          points: q.points,
          correctAnswer: q.correctAnswer,
          options:
            q.options?.length > 0
              ? {
                  create: q.options.map((o) => ({
                    text: o.text,
                    isCorrect: o.isCorrect,
                    imageUrl: o.imageUrl,
                  })),
                }
              : undefined,
        })),
      },
    },
  });

  return {
    success: true,
    quizId: quiz.id,
    questionsCount: questions.length,
    questions, // parsed questions for preview
  };
}