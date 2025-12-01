// app/teacher/quizzes/[quizId]/results/ChartAndButtons.tsx
"use client";

import React, { useState } from "react";
import QuizScoreChart from "@/app/admin/quizzes/[quizId]/QuizScoreChart";
import ResultsModals from "./ResultsModals";

interface ChartAndButtonsProps {
  studentScores: { name: string; score: number; focusLossCount: number }[];
  maxScore: number;
  totalFocusLosses: number;
  averageFocusLoss: number;
  maxFocusLoss: number;
  noFocusLossCount: number;
  lowFocusLossCount: number;
  highFocusLossCount: number;
  focusLossCounts: number[];
  quizAttemptsCount: number;
  scores: number[];
}

export default function ChartAndButtons({
  studentScores,
  maxScore,
  totalFocusLosses,
  averageFocusLoss,
  maxFocusLoss,
  noFocusLossCount,
  lowFocusLossCount,
  highFocusLossCount,
  focusLossCounts,
  quizAttemptsCount,
  scores
}: ChartAndButtonsProps) {
  const [showFocusLossModal, setShowFocusLossModal] = useState(false);
  const [showAdditionalStatsModal, setShowAdditionalStatsModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Chart Section - Full width */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Scores Distribution</h3>
        <div className="h-[400px]">
          <QuizScoreChart
            data={studentScores}
            maxScore={maxScore}
          />
        </div>
      </div>

      {/* Stats Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setShowFocusLossModal(true)}
          className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Focus Loss Stats
        </button>
        <button 
          onClick={() => setShowAdditionalStatsModal(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Additional Stats
        </button>
      </div>

      {/* Modals */}
      <ResultsModals
        showFocusLossModal={showFocusLossModal}
        setShowFocusLossModal={setShowFocusLossModal}
        showAdditionalStatsModal={showAdditionalStatsModal}
        setShowAdditionalStatsModal={setShowAdditionalStatsModal}
        totalFocusLosses={totalFocusLosses}
        averageFocusLoss={averageFocusLoss}
        maxFocusLoss={maxFocusLoss}
        noFocusLossCount={noFocusLossCount}
        lowFocusLossCount={lowFocusLossCount}
        highFocusLossCount={highFocusLossCount}
        focusLossCounts={focusLossCounts}
        quizAttemptsCount={quizAttemptsCount}
        scores={scores}
        maxScore={maxScore}
      />
    </div>
  );
}