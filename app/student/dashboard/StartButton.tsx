// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function StartButton({ quiz }: { quiz: any }) {
//   const router = useRouter();
//   const [canStart, setCanStart] = useState(false);

//   useEffect(() => {
//     if (!quiz.startTime || !quiz.duration) return;

//     const start = new Date(quiz.startTime);
//     const end = new Date(start.getTime() + quiz.duration * 60000);

//     const checkTime = () => {
//       const now = new Date();
//       setCanStart(now >= start && now < end);
//     };

//     checkTime();
//     const interval = setInterval(checkTime, 1000);
//     return () => clearInterval(interval);
//   }, [quiz.startTime, quiz.duration]);

//   if (!canStart) return null;

//   return (
//     <button
//       onClick={() => router.push(`/student/quizzes/${quiz.id}`)}
//       className="mt-6 w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-2 rounded-xl transition transform hover:-translate-y-1 shadow-lg"
//     >
//       Start Exam
//     </button>
//   );
// }


// app/student/dashboard/StartButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  quizId: string;
  startTimeISO: string | null;
  duration?: number; // minutes
};

export default function StartButton({ quizId, startTimeISO, duration = 60 }: Props) {
  const router = useRouter();
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!startTimeISO) return null;

  const start = new Date(startTimeISO);
  const end = new Date(start.getTime() + duration * 60000);
  const hasStarted = now >= start;
  const hasEnded = now >= end;

  // Only show the button while live
  if (!hasStarted || hasEnded) return null;

  async function handleStart() {
    // Option A: navigate to an attempt landing page where the attempt is created server-side
    // router.push(`/student/quiz/${quizId}/start`);
    //
    // Option B: call an API to create an attempt and then navigate to the attempt page
    // (example: POST /api/quiz/[id]/attempt -> returns attemptId)
    //
    // For now we'll simply navigate to a route where you can handle attempt creation.
    router.push(`/student/quiz/${quizId}`);
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleStart}
        className="px-5 py-2 rounded-lg font-semibold shadow hover:shadow-md transition-colors bg-indigo-600 text-white"
      >
        Start Exam
      </button>
    </div>
  );
}
