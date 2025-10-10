"use client";

import React from "react";
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";
import { Quiz, QuizAttempt, Question, Option } from "@prisma/client";

// Define a type for a quiz with its questions and options
type QuizWithDetails = Quiz & {
  questions: (Question & { options: Option[] })[];
  attempts?: QuizAttempt[];
};

interface QuizCardClientProps {
  quiz: QuizWithDetails;
}

export default function QuizCardClient({ quiz }: QuizCardClientProps) {
  if (!quiz.startDate || !quiz.startTime) {
    return null;
  }

  // Combine the separate date and time fields into a single Date object
  const quizStartDateTime = new Date(
    quiz.startDate.getFullYear(),
    quiz.startDate.getMonth(),
    quiz.startDate.getDate(),
    quiz.startTime.getHours(),
    quiz.startTime.getMinutes(),
    quiz.startTime.getSeconds()
  );

  const isAvailable = quizStartDateTime <= new Date();
  const isCompleted =
    quiz.attempts && quiz.attempts.some((attempt) => attempt.isSubmitted);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
        <p className="mt-2 text-gray-600">{quiz.description}</p>
        <p className="mt-4 text-sm text-gray-500">
          Duration: {quiz.duration} minutes
        </p>
      </div>
      <div className="mt-4">
        {isCompleted ? (
          <span className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-md">
            Already Completed
          </span>
        ) : isAvailable ? (
          <Link
            href={`/student/quiz/${quiz.id}`}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Start Quiz
          </Link>
        ) : (
          <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md">
            <span>Starts in:</span>
            <CountdownTimer targetDate={quizStartDateTime.toISOString()} />
          </div>
        )}
      </div>
    </div>
  );
}
