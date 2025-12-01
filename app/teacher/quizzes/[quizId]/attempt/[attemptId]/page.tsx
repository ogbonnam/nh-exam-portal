// app/teacher/quizzes/[quizId]/attempt/[attemptId]/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient, QuizAttempt, Question, User, Option, UserAnswer, QuestionType } from "@prisma/client";
import Link from "next/link";
import AttemptPageClient from "./AttemptPageClient";

declare global {
  // eslint-disable-next-line no-var
  var __next_prisma__: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.__next_prisma__ ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") global.__next_prisma__ = prisma;

type QuestionWithDetails = Question & {
  options: Option[];
  userAnswers: (UserAnswer & { student: User })[];
};

type QuizAttemptWithDetails = QuizAttempt & {
  student: User;
  quiz: {
    id: string;
    title: string;
    description: string | null;
    teacherId: string;
    questions: QuestionWithDetails[];
  };
};

// Define the type for the processed question that will be passed to the client
type ProcessedQuestion = Question & {
  options: Option[];
  userAnswer?: {
    id: string;
    textAnswer: string | null;
    optionIds: string[];
    isCorrect: boolean | null;
    submittedAt: Date;
    studentId: string;
    questionId: string;
    attemptId: string;
    student: User;
  } | null;
  isCorrect?: boolean; // Changed to boolean | undefined to match client component
};

export default async function TeacherQuizAttemptPage(props: any): Promise<React.ReactElement> {
  // normalize params (handles both sync object and Promise)
  const rawParams = await Promise.resolve(props?.params);
  const params = (rawParams ?? {}) as { quizId?: string; attemptId?: string };

  const { quizId, attemptId } = params;
  if (!quizId || !attemptId) {
    return <div className="text-center mt-8">Missing quiz or attempt id.</div>;
  }

  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");

  // Fetch quiz attempt with all necessary relations
  const attempt: QuizAttemptWithDetails | null = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      student: true,
      quiz: {
        include: {
          questions: {
            include: {
              options: true,
              userAnswers: {
                where: { attemptId },
                include: { student: true },
              },
            },
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });

  if (!attempt) return <div className="text-center mt-8">Quiz attempt not found.</div>;

  // Authorization: teachers may view only attempts for their quizzes
  if (user.role === "TEACHER" && user.id !== attempt.quiz.teacherId) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-gray-600">You don't have permission to view this quiz attempt.</p>
        <Link href={`/teacher/quizzes/${quizId}/results`} className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Results
        </Link>
      </div>
    );
  }

  // Process questions with user answers and use stored correctness from database
  const questionsWithAnswers: ProcessedQuestion[] = attempt.quiz.questions.map(q => {
    const userAnswer = q.userAnswers[0] || null;
    
    // Use the stored isCorrect value from the database if available
    // Only calculate if not already graded
    let isCorrect: boolean | undefined = undefined;
    
    if (userAnswer?.isCorrect !== null && userAnswer?.isCorrect !== undefined) {
      // Use the stored value from the database
      isCorrect = userAnswer.isCorrect;
    } else {
      // Calculate if not already graded
      if (q.type === QuestionType.OPTIONS) {
        const correctOption = q.options.find((o: Option) => o.isCorrect);
        if (userAnswer?.optionIds?.[0] && correctOption && userAnswer.optionIds[0] === correctOption.id) {
          isCorrect = true;
        } else {
          isCorrect = false;
        }
      } else if (q.type === QuestionType.CHECKBOX) {
        // Get all correct option IDs
        const correctOptionIds = q.options
          .filter((o: Option) => o.isCorrect)
          .map((o: Option) => o.id);
        
        // Get selected option IDs
        const selectedOptionIds = userAnswer?.optionIds || [];
        
        // Check if all correct options are selected and no incorrect ones
        const allCorrectSelected = correctOptionIds.every(id => selectedOptionIds.includes(id));
        const noIncorrectSelected = selectedOptionIds.every(id => correctOptionIds.includes(id));
        
        isCorrect = allCorrectSelected && noIncorrectSelected;
      } else if (q.type === QuestionType.FILL_IN_THE_BLANK) {
        const studentText = userAnswer?.textAnswer?.toLowerCase().trim();
        const correctText = q.correctAnswer?.toLowerCase().trim();
        isCorrect = !!(studentText && correctText && studentText === correctText);
      }
      // For paragraph questions, isCorrect remains undefined
    }
    
    return {
      ...q,
      userAnswer,
      isCorrect,
    };
  });

  // Initialize manual scores based on stored grades in the database
  const initialManualScores: Record<string, number> = {};
  
  // Check if the attempt has been graded (has a score)
  if (attempt.score !== null) {
    // If graded, we need to reconstruct the scores from the database
    // We'll use the isCorrect flag and question points to determine scores
    questionsWithAnswers.forEach(q => {
      if (q.type === QuestionType.PARAGRAPH) {
        // For paragraph questions, we can't determine the exact score from isCorrect alone
        // since partial credit might have been given
        // Default to full points if marked correct, 0 if marked incorrect
        initialManualScores[q.id] = q.isCorrect ? (q.points || 1) : 0;
      } else {
        // For other questions, use the isCorrect flag
        initialManualScores[q.id] = q.isCorrect ? (q.points || 1) : 0;
      }
    });
  } else {
    // If not graded, initialize based on correctness
    questionsWithAnswers.forEach(q => {
      if (q.type === QuestionType.PARAGRAPH) {
        // For paragraph questions, start with full points (teacher will adjust)
        initialManualScores[q.id] = q.points || 1;
      } else {
        // For other questions, set initial score based on correctness
        initialManualScores[q.id] = q.isCorrect ? (q.points || 1) : 0;
      }
    });
  }

  // Calculate max score
  const maxScore = questionsWithAnswers.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <AttemptPageClient 
      attempt={attempt}
      questionsWithAnswers={questionsWithAnswers}
      initialManualScores={initialManualScores}
      maxScore={maxScore}
      storedTotalScore={attempt.score} // Pass the stored total score
    />
  );
}