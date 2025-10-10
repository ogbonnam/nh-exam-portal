// app/student/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * getQuizData
 * Returns quiz, attempt, existingAnswers, normalized questions, startTimeISO, endTimeISO, serverNowISO
 * Performs auth checks and redirects when not allowed / ended / not yet started / already submitted.
 */
export async function getQuizData(quizId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { include: { options: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!quiz || !quiz.isPublished) {
    redirect("/student/dashboard");
  }

  const startTimeISO = quiz.startTime ? new Date(quiz.startTime).toISOString() : null;
  const endTimeISO = quiz.startTime
    ? new Date(new Date(quiz.startTime).getTime() + (quiz.duration || 0) * 60000).toISOString()
    : null;
  const serverNowISO = new Date().toISOString();

  // if quiz has startDate and server time is before start -> not yet available
  if (quiz.startDate && new Date(serverNowISO) < new Date(quiz.startDate)) {
    redirect("/student/dashboard?error=quiz_not_available");
  }

  // if quiz ended -> redirect
  if (endTimeISO && new Date(serverNowISO) >= new Date(endTimeISO)) {
    redirect("/student/dashboard?ended=true");
  }

  // Prevent re-take if already submitted
  const existingSubmitted = await prisma.quizAttempt.findFirst({
    where: { studentId: session.user.id, quizId, isSubmitted: true },
  });
  if (existingSubmitted) redirect("/student/dashboard");

  // find or create in-progress attempt
  let attempt = await prisma.quizAttempt.findFirst({
    where: { studentId: session.user.id, quizId, isSubmitted: false },
  });

  let questions = quiz.questions.slice();

  if (attempt && attempt.questionOrder && attempt.questionOrder.length > 0) {
    // reorder according to saved questionOrder
    questions.sort((a, b) => {
      const aIndex = attempt!.questionOrder.indexOf(a.id);
      const bIndex = attempt!.questionOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  } else {
    // shuffle and persist questionOrder
    questions = shuffleArray(questions);
    const questionOrder = questions.map((q) => q.id);

    if (attempt) {
      attempt = await prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: { questionOrder },
      });
    } else {
      attempt = await prisma.quizAttempt.create({
        data: {
          studentId: session.user.id,
          quizId,
          questionOrder,
          startedAt: new Date(),
        },
      });
    }
  }

  // Shuffle options per question
  questions.forEach((q) => {
    if (q.options) q.options = shuffleArray(q.options);
  });

  const existingAnswers = await prisma.userAnswer.findMany({
    where: { attemptId: attempt!.id },
  });

  // normalize questions for client
  const normalizedQuestions = questions.map((q) => ({
    id: q.id,
    text: q.text, // your schema uses `text`
    imageUrl: q.imageUrl,
    type: q.type,
    points: q.points,
    options: q.options.map((o) => ({
      id: o.id,
      text: o.text,
      imageUrl: o.imageUrl,
      isCorrect: o.isCorrect,
    })),
  }));

  return {
    quiz,
    attempt,
    existingAnswers,
    questions: normalizedQuestions,
    startTimeISO,
    endTimeISO,
    serverNowISO,
  };
}

/**
 * saveAnswers: upserts answers for a given attempt (ownership + time checks)
 * arguments: attemptId, answers: [{ questionId, optionIds: string[], textAnswer }]
 */
export async function saveAnswers(attemptId: string, answers: any[]) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { error: "Unauthorized" };
  }

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) return { error: "Attempt not found" };
  if (attempt.studentId !== session.user.id) return { error: "Unauthorized attempt" };

  // block saves after quiz end
  const quiz = await prisma.quiz.findUnique({ where: { id: attempt.quizId } });
  if (quiz?.startTime) {
    const quizEnd = new Date(new Date(quiz.startTime).getTime() + (quiz.duration || 0) * 60000);
    if (new Date() > quizEnd) {
      return { error: "Exam has ended; saving is disabled." };
    }
  }

  try {
    // delete previous answers for the attempt then bulk insert new
    await prisma.userAnswer.deleteMany({ where: { attemptId } });

    const createData = answers.map((a) => ({
      studentId: session.user.id,
      questionId: a.questionId,
      attemptId,
      textAnswer: a.textAnswer ?? null,
      optionIds: a.optionIds ?? [],
      submittedAt: new Date(),
    }));

    if (createData.length > 0) {
      await prisma.userAnswer.createMany({ data: createData });
    }

    return { success: true };
  } catch (err) {
    console.error("saveAnswers error:", err);
    return { error: "Failed to save answers." };
  }
}

/**
 * submitQuiz (transactional)
 * - locks attempt row (FOR UPDATE) to prevent concurrent scoring races
 * - if already submitted -> idempotent success
 * - calculates score and updates attempt in same transaction
 */
export async function submitQuiz(attemptId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { error: "Unauthorized" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const locked = (await tx.$queryRawUnsafe(
        `SELECT id, "isSubmitted", "studentId", "quizId" FROM "QuizAttempt" WHERE id = $1 FOR UPDATE`,
        attemptId
      )) as Array<any>;

      const attemptRow = locked && locked[0];
      if (!attemptRow) return { error: "Attempt not found" };
      if (attemptRow.studentId !== session.user.id) return { error: "Unauthorized attempt" };
      if (attemptRow.isSubmitted) return { success: true, alreadySubmitted: true };

      const attemptWithQuiz = await tx.quizAttempt.findUnique({
        where: { id: attemptId },
        include: { quiz: { include: { questions: { include: { options: true } } } } },
      });

      if (!attemptWithQuiz) return { error: "Attempt/Quiz not found" };

      // Load answers
      const answers = await tx.userAnswer.findMany({
        where: { attemptId },
        include: { question: { include: { options: true } } },
      });

      let score = 0;

      console.log("=== DEBUG: SCORING START ===");
      console.log("Total Questions:", attemptWithQuiz.quiz.questions.length);
      console.log("Student Answers Count:", answers.length);

      for (const ans of answers) {
        const q = attemptWithQuiz.quiz.questions.find((x) => x.id === ans.questionId);
        if (!q) {
          console.log("Question not found for answer:", ans.questionId);
          continue;
        }

        console.log(`Question: "${q.text}" (${q.type})`);
        console.log("Student answer:", ans.optionIds || ans.textAnswer);

        if (q.type === "OPTIONS") {
          const correct = q.options.find((o) => o.isCorrect);
          const isCorrect = ans.optionIds && ans.optionIds[0] === correct?.id;
          console.log("Correct Option ID:", correct?.id);
          console.log("Student Option ID:", ans.optionIds?.[0]);
          console.log("Match:", isCorrect);
          if (isCorrect) {
            score += q.points ?? 1;
            console.log("✅ +", q.points ?? 1, "point(s)");
          } else {
            console.log("❌ No points");
          }
        } else if (q.type === "CHECKBOX") {
          const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
          const selected = (ans.optionIds || []).slice().sort();
          const isCorrect = JSON.stringify(correctIds) === JSON.stringify(selected);
          console.log("Correct IDs:", correctIds);
          console.log("Selected IDs:", selected);
          console.log("Match:", isCorrect);
          if (isCorrect) {
            score += q.points ?? 1;
            console.log("✅ +", q.points ?? 1, "point(s)");
          } else {
            console.log("❌ No points");
          }
        } else if (q.type === "FILL_IN_THE_BLANK") {
          const studentText = ans.textAnswer?.toLowerCase().trim();
          const correctText = q.correctAnswer?.toLowerCase().trim();
          const isCorrect = studentText === correctText;
          console.log("Correct Text:", correctText);
          console.log("Student Text:", studentText);
          console.log("Match:", isCorrect);
          if (isCorrect) {
            score += q.points ?? 1;
            console.log("✅ +", q.points ?? 1, "point(s)");
          } else {
            console.log("❌ No points");
          }
        }
      }

      console.log("=== DEBUG: FINAL SCORE ===");
      console.log("Student:", session.user.email || session.user.id);
      console.log("Total Score:", score);

      await tx.quizAttempt.update({
        where: { id: attemptId },
        data: { isSubmitted: true, score, submittedAt: new Date() },
      });

      return { success: true, score };
    });

    console.log("=== DEBUG RESULT ===", result);
    return result;
  } catch (err) {
    console.error("submitQuiz transaction error:", err);
    return { error: "Failed to submit quiz (server error)." };
  }
}


/**
 * trackFocusLoss
 */
export async function trackFocusLoss(attemptId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") return { error: "Unauthorized" };

    const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.studentId !== session.user.id) return { error: "Attempt not found or unauthorized" };

    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { focusLossCount: { increment: 1 } as any },
    });

    return { success: true };
  } catch (err) {
    console.error("trackFocusLoss error:", err);
    return { error: "Failed to track focus" };
  }
}
