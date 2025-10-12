// app/student/dashboard/QuizCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import CountdownBadge from "./CountdownTimer";
import StartButton from "./StartButton";

export default function QuizCard({ quiz }: { quiz: any }) {
  const startTime = quiz.startDate ? new Date(quiz.startDate) : null;
  const duration = quiz.duration ?? 60;
  const endTime = startTime ? new Date(startTime.getTime() + duration * 60000) : null;

  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasStarted = startTime ? now >= startTime : false;
  const hasEnded = endTime ? now >= endTime : false;

  const serverStartLabel = startTime?.toLocaleString() ?? "TBD";
  const serverEndLabel = endTime?.toLocaleString() ?? "TBD";
  const serverRemainingSeconds = endTime
    ? Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
    : null;

  return (
    <div
      className={`relative p-6 rounded-xl shadow-xl flex flex-col justify-between transition-transform transform hover:-translate-y-1 hover:shadow-2xl ${
        !hasStarted || hasEnded ? "opacity-90 bg-white" : "bg-gradient-to-br from-indigo-400 to-purple-500 text-white"
      }`}
    >
      <CountdownBadge
        startTimeISO={quiz.startDate}
        duration={duration}
        serverRemainingSeconds={serverRemainingSeconds}
        serverStartLabel={serverStartLabel}
        serverEndLabel={serverEndLabel}
      />

      <div>
        <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
        {quiz.description && <p className="mb-2 text-sm md:text-base">{quiz.description}</p>}
        <p className="text-sm font-medium">
          <strong>Start:</strong> {serverStartLabel}
        </p>
        <p className="text-sm font-medium">
          <strong>End:</strong> {serverEndLabel}
        </p>
        <p className="text-sm font-medium">
          <strong>Duration:</strong> {duration} minutes
        </p>
        <p className="text-sm font-medium">
          <strong>Year/Class:</strong> {quiz.yearGroup} / {quiz.className}
        </p>
      </div>

      <StartButton quizId={quiz.id} startTimeISO={quiz.startDate} duration={duration} />
    </div>
  );
}
