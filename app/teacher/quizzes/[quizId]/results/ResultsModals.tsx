// app/teacher/quizzes/[quizId]/results/ResultsModals.tsx
"use client";

import React from "react";

interface ResultsModalsProps {
  showFocusLossModal: boolean;
  setShowFocusLossModal: (show: boolean) => void;
  showAdditionalStatsModal: boolean;
  setShowAdditionalStatsModal: (show: boolean) => void;
  totalFocusLosses: number;
  averageFocusLoss: number;
  maxFocusLoss: number;
  noFocusLossCount: number;
  lowFocusLossCount: number;
  highFocusLossCount: number;
  focusLossCounts: number[];
  quizAttemptsCount: number;
  scores: number[];
  maxScore: number;
}

export default function ResultsModals({
  showFocusLossModal,
  setShowFocusLossModal,
  showAdditionalStatsModal,
  setShowAdditionalStatsModal,
  totalFocusLosses,
  averageFocusLoss,
  maxFocusLoss,
  noFocusLossCount,
  lowFocusLossCount,
  highFocusLossCount,
  focusLossCounts,
  quizAttemptsCount,
  scores,
  maxScore
}: ResultsModalsProps) {
  return (
    <>
      {/* Focus Loss Stats Modal */}
      {showFocusLossModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Focus Loss Statistics</h3>
              <button 
                onClick={() => setShowFocusLossModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Total Focus Losses</span>
                  <span className="text-sm font-medium">{totalFocusLosses}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, totalFocusLosses * 10)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Average per Student</span>
                  <span className="text-sm font-medium">{averageFocusLoss.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, averageFocusLoss * 25)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Maximum by a Student</span>
                  <span className="text-sm font-medium">{maxFocusLoss}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, maxFocusLoss * 10)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium mb-3">Focus Loss Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">No focus loss (0)</span>
                    <span className="text-sm font-medium">{noFocusLossCount} students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Low focus loss (1-2)</span>
                    <span className="text-sm font-medium">{lowFocusLossCount} students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">High focus loss (3+)</span>
                    <span className="text-sm font-medium">{highFocusLossCount} students</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium mb-2">Focus Loss Indicators</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-xs">No focus loss (0)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="text-xs">Low focus loss (1-2)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-xs">High focus loss (3+)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowFocusLossModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats Modal */}
      {showAdditionalStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Additional Statistics</h3>
              <button 
                onClick={() => setShowAdditionalStatsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Submission Rate</p>
                  <p className="text-2xl font-bold text-blue-600">100%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-green-600">{quizAttemptsCount}</p>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Students with No Focus Loss</span>
                  <span className="text-xl font-bold text-purple-600">{noFocusLossCount}/{focusLossCounts.length}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(noFocusLossCount / focusLossCounts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Students with High Focus Loss</span>
                  <span className="text-xl font-bold text-red-600">{highFocusLossCount}/{focusLossCounts.length}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(highFocusLossCount / focusLossCounts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Students with Low Focus Loss</span>
                  <span className="text-xl font-bold text-yellow-600">{lowFocusLossCount}/{focusLossCounts.length}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(lowFocusLossCount / focusLossCounts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Score Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">High Scores (80%+)</span>
                    <span className="text-sm font-medium">
                      {scores.filter(score => (score / maxScore) * 100 >= 80).length} students
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Medium Scores (60-79%)</span>
                    <span className="text-sm font-medium">
                      {scores.filter(score => (score / maxScore) * 100 >= 60 && (score / maxScore) * 100 < 80).length} students
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Low Scores (&lt;60%)</span>
                    <span className="text-sm font-medium">
                      {scores.filter(score => (score / maxScore) * 100 < 60).length} students
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowAdditionalStatsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}