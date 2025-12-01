// // app/student/dashboard/QuizCard.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import CountdownBadge from "./CountdownTimer";
// import StartButton from "./StartButton";

// export default function QuizCard({ quiz }: { quiz: any }) {
//   const startTime = quiz.startDate ? new Date(quiz.startDate) : null;
//   const duration = quiz.duration ?? 60;
//   const endTime = startTime ? new Date(startTime.getTime() + duration * 60000) : null;

//   const [now, setNow] = useState<Date>(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const hasStarted = startTime ? now >= startTime : false;
//   const hasEnded = endTime ? now >= endTime : false;

//   const serverStartLabel = startTime?.toLocaleString() ?? "TBD";
//   const serverEndLabel = endTime?.toLocaleString() ?? "TBD";
//   const serverRemainingSeconds = endTime
//     ? Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
//     : null;

//   return (
//     <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
//       {/* Header with gradient background */}
//       <div className={`p-4 ${!hasStarted || hasEnded ? 'bg-gray-200' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
//         <CountdownBadge
//           startTimeISO={quiz.startDate}
//           duration={duration}
//           serverRemainingSeconds={serverRemainingSeconds}
//           serverStartLabel={serverStartLabel}
//           serverEndLabel={serverEndLabel}
//         />
//       </div>
      
//       {/* Content area */}
//       <div className="p-6">
//         <h2 className="text-2xl font-bold mb-3 text-gray-800">{quiz.title}</h2>
//         {quiz.description && (
//           <p className="mb-4 text-gray-600 text-base leading-relaxed">{quiz.description}</p>
//         )}
        
//         {/* Quiz details in a grid layout */}
//         <div className="grid grid-cols-2 gap-3 mb-4">
//           <div className="bg-gray-50 p-3 rounded-lg">
//             <p className="text-xs text-gray-500 font-medium">START TIME</p>
//             <p className="text-sm font-semibold text-gray-800">{serverStartLabel}</p>
//           </div>
//           <div className="bg-gray-50 p-3 rounded-lg">
//             <p className="text-xs text-gray-500 font-medium">END TIME</p>
//             <p className="text-sm font-semibold text-gray-800">{serverEndLabel}</p>
//           </div>
//           <div className="bg-gray-50 p-3 rounded-lg">
//             <p className="text-xs text-gray-500 font-medium">DURATION</p>
//             <p className="text-sm font-semibold text-gray-800">{duration} minutes</p>
//           </div>
//           <div className="bg-gray-50 p-3 rounded-lg">
//             <p className="text-xs text-gray-500 font-medium">CLASS</p>
//             <p className="text-sm font-semibold text-gray-800">{quiz.yearGroup} / {quiz.className}</p>
//           </div>
//         </div>
//       </div>
      
//       {/* Footer with button */}
//       <div className="px-6 pb-6">
//         <StartButton quizId={quiz.id} startTimeISO={quiz.startDate} duration={duration} />
//       </div>
//     </div>
//   );
// }

// app/student/dashboard/QuizCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import CountdownBadge from "./CountdownTimer";
import StartButton from "./StartButton";

export default function QuizCard({ quiz, submissionStatus = "not_submitted" }: { quiz: any; submissionStatus?: "not_submitted" | "submitted_by_user" | "submitted_by_system" }) {
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
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header with gradient background */}
      <div className={`p-4 ${!hasStarted || hasEnded ? 'bg-gray-200' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
        <CountdownBadge
          startTimeISO={quiz.startDate}
          duration={duration}
          serverRemainingSeconds={serverRemainingSeconds}
          serverStartLabel={serverStartLabel}
          serverEndLabel={serverEndLabel}
        />
      </div>
      
      {/* Content area */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-3 text-gray-800">{quiz.title}</h2>
        {quiz.description && (
          <p className="mb-4 text-gray-600 text-base leading-relaxed">{quiz.description}</p>
        )}
        
        {/* Quiz details in a grid layout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">START TIME</p>
            <p className="text-sm font-semibold text-gray-800">{serverStartLabel}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">END TIME</p>
            <p className="text-sm font-semibold text-gray-800">{serverEndLabel}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">DURATION</p>
            <p className="text-sm font-semibold text-gray-800">{duration} minutes</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">CLASS</p>
            <p className="text-sm font-semibold text-gray-800">{quiz.yearGroup} / {quiz.className}</p>
          </div>
        </div>
      </div>
      
      {/* Footer with button */}
      <div className="px-6 pb-6">
        <StartButton 
          quizId={quiz.id} 
          startTimeISO={quiz.startDate} 
          duration={duration}
          submissionStatus={submissionStatus}
        />
      </div>
    </div>
  );
}