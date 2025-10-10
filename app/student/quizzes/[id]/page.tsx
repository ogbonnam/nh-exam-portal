"use client"; // Client Component needed for countdown & timer

import { useEffect, useState } from "react";

export default function ExamPage({ params }: { params: { id: string } }) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds
  const [examStarted, setExamStarted] = useState(false);
  const durationMinutes = 30; // fetch real duration from server

  useEffect(() => {
    if (!examStarted) return;
    setTimeLeft(durationMinutes * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev) return 0;
        if (prev <= 1) {
          clearInterval(interval);
          alert("Time's up! Exam ended.");
          // TODO: submit exam automatically
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted]);

  return (
    <div className="container mx-auto p-4">
      {!examStarted ? (
        <button
          onClick={() => setExamStarted(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Start Exam
        </button>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Exam in Progress</h2>
          <p>
            Time Left:{" "}
            {timeLeft && `${Math.floor(timeLeft / 60)}:${timeLeft % 60}`}
          </p>
          {/* TODO: Render questions here */}
        </div>
      )}
    </div>
  );
}
