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
// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// type Props = {
//   quizId: string;
//   startTimeISO: string | null;
//   duration?: number; // minutes
// };

// export default function StartButton({ quizId, startTimeISO, duration = 60 }: Props) {
//   const router = useRouter();
//   const [now, setNow] = useState<Date>(new Date());

//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   if (!startTimeISO) return null;

//   const start = new Date(startTimeISO);
//   const end = new Date(start.getTime() + duration * 60000);
//   const hasStarted = now >= start;
//   const hasEnded = now >= end;

//   // Only show the button while live
//   if (!hasStarted || hasEnded) return null;

//   async function handleStart() {
//     // Option A: navigate to an attempt landing page where the attempt is created server-side
//     // router.push(`/student/quiz/${quizId}/start`);
//     //
//     // Option B: call an API to create an attempt and then navigate to the attempt page
//     // (example: POST /api/quiz/[id]/attempt -> returns attemptId)
//     //
//     // For now we'll simply navigate to a route where you can handle attempt creation.
//     router.push(`/student/quiz/${quizId}`);
//   }

//   return (
//     <div className="mt-6">
//       <button
//         onClick={handleStart}
//         className="px-5 py-2 rounded-lg font-semibold shadow hover:shadow-md transition-colors bg-indigo-600 text-white"
//       >
//         Start Exam
//       </button>
//     </div>
//   );
// }


// // app/student/dashboard/StartButton.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import QuizStartModal from "./QuizStartModal";

// type Props = {
//   quizId: string;
//   startTimeISO: string | null;
//   duration?: number; // minutes
//   submissionStatus?: "not_submitted" | "submitted_by_user" | "submitted_by_system";
// };

// export default function StartButton({ quizId, startTimeISO, duration = 60, submissionStatus = "not_submitted" }: Props) {
//   const router = useRouter();
//   const [now, setNow] = useState<Date>(new Date());
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   if (!startTimeISO) return null;

//   const start = new Date(startTimeISO);
//   const end = new Date(start.getTime() + duration * 60000);
//   const hasStarted = now >= start;
//   const hasEnded = now >= end;

//   // Show submission status if quiz has been submitted
//   if (submissionStatus !== "not_submitted") {
//     return (
//       <div className="mt-6">
//         <button
//           disabled
//           className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md ${
//             submissionStatus === "submitted_by_user" 
//               ? "bg-green-100 text-green-800 border border-green-200" 
//               : "bg-yellow-100 text-yellow-800 border border-yellow-200"
//           }`}
//         >
//           <div className="flex items-center justify-center">
//             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//             </svg>
//             {submissionStatus === "submitted_by_user" 
//               ? "Exam submitted by you" 
//               : "Exam submitted by the system"}
//           </div>
//         </button>
//       </div>
//     );
//   }

//   // Only show the button while live
//   if (!hasStarted || hasEnded) return null;

//   async function handleStart() {
//     setShowModal(true);
//   }

//   return (
//     <>
//       <div className="mt-6">
//         <button
//           onClick={handleStart}
//           className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
//         >
//           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//           </svg>
//           Start Exam
//         </button>
//       </div>
//       {showModal && <QuizStartModal quizId={quizId} onClose={() => setShowModal(false)} />}
//     </>
//   );
// }

// app/student/dashboard/StartButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizStartModal from "./QuizStartModal";

type Props = {
  quizId: string;
  startTimeISO: string | null;
  duration?: number; // minutes
  submissionStatus?: "not_submitted" | "submitted_by_user" | "submitted_by_system";
};

export default function StartButton({ quizId, startTimeISO, duration = 60, submissionStatus = "not_submitted" }: Props) {
  const router = useRouter();
  const [now, setNow] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!startTimeISO) return null;

  const start = new Date(startTimeISO);
  const end = new Date(start.getTime() + duration * 60000);
  const hasStarted = now >= start;
  const hasEnded = now >= end;

  // Show submission status if quiz has been submitted
  if (submissionStatus !== "not_submitted") {
    return (
      <div className="mt-6">
        <button
          disabled
          className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md ${
            submissionStatus === "submitted_by_user" 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
          }`}
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Submitted
          </div>
        </button>
        <div className="mt-2 text-center text-sm text-gray-600">
          {submissionStatus === "submitted_by_user" 
            ? "You submitted this exam" 
            : "System submitted when time ended"}
        </div>
      </div>
    );
  }

  // Only show the button while live
  if (!hasStarted || hasEnded) return null;

  async function handleStart() {
    setShowModal(true);
  }

  return (
    <>
      <div className="mt-6">
        <button
          onClick={handleStart}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Start Exam
        </button>
      </div>
      {showModal && <QuizStartModal quizId={quizId} onClose={() => setShowModal(false)} />}
    </>
  );
}