// "use client";

// import { useState, useEffect } from "react";
// import { formatDistanceToNowStrict } from "date-fns";

// export default function CountdownBadge({ quiz }: { quiz: any }) {
//   const [status, setStatus] = useState("");

//   useEffect(() => {
//     if (!quiz.startTime || !quiz.duration) return;

//     const start = new Date(quiz.startTime);
//     const end = new Date(start.getTime() + quiz.duration * 60000);

//     const updateStatus = () => {
//       const now = new Date();
//       if (now < start) {
//         setStatus(`Starts in ${formatDistanceToNowStrict(start)}`);
//       } else if (now >= start && now < end) {
//         setStatus("Available");
//       } else {
//         setStatus("Ended");
//       }
//     };

//     updateStatus();
//     const interval = setInterval(updateStatus, 1000);
//     return () => clearInterval(interval);
//   }, [quiz.startTime, quiz.duration]);

//   const badgeColor =
//     status === "Available"
//       ? "bg-green-500"
//       : status === "Ended"
//       ? "bg-red-500"
//       : "bg-yellow-500 animate-pulse";

//   return (
//     <span
//       className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white font-semibold text-sm`}
//     >
//       {status}
//     </span>
//   );
// }


// app/student/dashboard/CountdownTimer.tsx
"use client";

import React, { useEffect, useState } from "react";

type Props = {
  startTimeISO: string | null;
  duration?: number; // minutes
  // serverRemainingSeconds: optional number computed on the server and passed in
  serverRemainingSeconds?: number | null;
  // Optional: allow server to pass formatted start/end strings if you want to avoid toLocaleString differences
  serverStartLabel?: string | null;
  serverEndLabel?: string | null;
};

function formatDurationMs(ms: number) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function CountdownBadge({
  startTimeISO,
  duration = 60,
  serverRemainingSeconds = null,
  serverStartLabel = null,
  serverEndLabel = null,
}: Props) {
  // If serverRemainingSeconds provided, use it as initial remaining seconds.
  // Otherwise compute from client clock at mount.
  const [remainingSec, setRemainingSec] = useState<number | null>(() => {
    if (serverRemainingSeconds !== null && typeof serverRemainingSeconds === "number") {
      return Math.max(0, Math.floor(serverRemainingSeconds));
    }
    // fallback initial calculation; this runs on client only
    if (!startTimeISO) return null;
    const start = new Date(startTimeISO).getTime();
    const end = start + duration * 60_000;
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!startTimeISO) return;

    // If serverRemainingSeconds exists, we already set initial remaining from it.
    // But still recalc once to handle small drift and then start interval.
    const start = new Date(startTimeISO).getTime();
    const end = start + duration * 60_000;

    // immediate sync (handles small skews)
    setRemainingSec(Math.max(0, Math.floor((end - Date.now()) / 1000)));

    const id = setInterval(() => {
      setRemainingSec(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    }, 1000);

    return () => clearInterval(id);
  }, [startTimeISO, duration]);

  if (!startTimeISO) {
    return (
      <div className="mb-4 inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
        No scheduled start
      </div>
    );
  }

  // We compute client labels (start/end) only for display after mount.
  const start = new Date(startTimeISO);
  const end = new Date(start.getTime() + duration * 60000);
  const startLabel = serverStartLabel ?? start.toLocaleString();
  const endLabel = serverEndLabel ?? end.toLocaleString();

  // If we don't yet have a remaining value, render a deterministic placeholder to avoid mismatch:
  if (remainingSec === null) {
    return (
      <div className="mb-4">
        <div className="inline-flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
            Starts soon
          </span>
          <span className="text-xs text-gray-600">Starts at {startLabel}</span>
        </div>
      </div>
    );
  }

  const isBefore = remainingSec > duration * 60; // still before start if remaining > duration
  const isDuring = remainingSec > 0 && remainingSec <= duration * 60;
  const isAfter = remainingSec === 0 && Date.now() >= end.getTime();

  // Note: compute text from remainingSec (seconds)
  const duringRemainingMs = remainingSec * 1000;
  const beforeRemainingMs = (start.getTime() - Date.now());
  const beforeLabel = formatDurationMs(beforeRemainingMs);
  const duringLabel = formatDurationMs(duringRemainingMs);

  return (
    <div className="mb-4">
      {Date.now() < start.getTime() && (
        <div className="inline-flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
            Starts in: {beforeLabel}
          </span>
          <span className="text-xs text-gray-600">Starts at {startLabel}</span>
        </div>
      )}

      {Date.now() >= start.getTime() && Date.now() < end.getTime() && (
        <div className="inline-flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            Live — ends in: {duringLabel}
          </span>
          <span className="text-xs text-gray-600">Ends at {endLabel}</span>
        </div>
      )}

      {Date.now() >= end.getTime() && (
        <div className="inline-flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
            Ended
          </span>
          <span className="text-xs text-gray-600">Ended at {endLabel}</span>
        </div>
      )}
    </div>
  );
}
