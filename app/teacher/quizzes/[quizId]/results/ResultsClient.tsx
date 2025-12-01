// app/teacher/quizzes/[quizId]/results/ResultsClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChartAndButtons from "./ChartAndButtons";
import StudentAnalysisModal from "./StudentAnalysisModal";
import { Download, FileText, BarChart3, X, Eye, Users, TrendingUp, AlertTriangle, UserCheck, RotateCcw, Lock } from "lucide-react";
import { Quiz, QuizAttempt, Question, User } from "@prisma/client";

type QuizWithRelations = Quiz & {
  teacher: User;
  questions: Question[];
  attempts: (QuizAttempt & { student: User })[];
};

export default function ResultsClient({ 
  quiz,
  attemptsWithScores,
  studentScores,
  maxScore,
  averageScore,
  highestScore,
  lowestScore,
  totalFocusLosses,
  averageFocusLoss,
  maxFocusLoss,
  noFocusLossCount,
  lowFocusLossCount,
  highFocusLossCount,
  focusLossCounts,
  scoreRanges,
  averageSubmissionTime,
  fastestSubmission,
  slowestSubmission
}: {
  quiz: QuizWithRelations;
  attemptsWithScores: { attempt: QuizAttempt & { student: User }; score: number }[];
  studentScores: { name: string; score: number; focusLossCount: number }[];
  maxScore: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalFocusLosses: number;
  averageFocusLoss: number;
  maxFocusLoss: number;
  noFocusLossCount: number;
  lowFocusLossCount: number;
  highFocusLossCount: number;
  focusLossCounts: number[];
  scoreRanges: {
    excellent: number;
    good: number;
    satisfactory: number;
    needsImprovement: number;
  };
  averageSubmissionTime: number;
  fastestSubmission: number;
  slowestSubmission: number;
}) {
  const router = useRouter();
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isStudentAnalysisModalOpen, setIsStudentAnalysisModalOpen] = useState(false);
  const [reopeningAttempt, setReopeningAttempt] = useState<{attemptId: string, studentName: string} | null>(null);
  const [closingAttempt, setClosingAttempt] = useState<{attemptId: string, studentName: string} | null>(null);
  const [isReopening, setIsReopening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Prepare student data for analysis modal
  const excellentStudents = attemptsWithScores
    .filter(({ score }) => score >= maxScore * 0.8)
    .map(({ attempt, score }) => ({
      name: attempt.student?.name ?? attempt.student?.email ?? "Unknown",
      score,
      percentage: Math.round((score / maxScore) * 100),
      attempt
    }));

  const goodStudents = attemptsWithScores
    .filter(({ score }) => score >= maxScore * 0.6 && score < maxScore * 0.8)
    .map(({ attempt, score }) => ({
      name: attempt.student?.name ?? attempt.student?.email ?? "Unknown",
      score,
      percentage: Math.round((score / maxScore) * 100),
      attempt
    }));

  const needsImprovementStudents = attemptsWithScores
    .filter(({ score }) => score < maxScore * 0.6)
    .map(({ attempt, score }) => ({
      name: attempt.student?.name ?? attempt.student?.email ?? "Unknown",
      score,
      percentage: Math.round((score / maxScore) * 100),
      attempt
    }));

  const handleReopenQuiz = async (attemptId: string, studentName: string) => {
    setReopeningAttempt({ attemptId, studentName });
    setActionError(null);
  };

  const handleCloseQuiz = async (attemptId: string, studentName: string) => {
    setClosingAttempt({ attemptId, studentName });
    setActionError(null);
  };

  const confirmReopenQuiz = async () => {
    if (!reopeningAttempt) return;
    
    setIsReopening(true);
    setActionError(null);
    
    try {
      const response = await fetch(`/api/teacher/quizzes/${quiz.id}/reopen-attempt/${reopeningAttempt.attemptId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reopen quiz');
      }
      
      setActionSuccess(`Quiz reopened successfully for ${reopeningAttempt.studentName}!`);
      setReopeningAttempt(null);
      router.refresh();
    } catch (err) {
      console.error("Error reopening quiz:", err);
      setActionError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsReopening(false);
    }
  };

  const confirmCloseQuiz = async () => {
    if (!closingAttempt) return;
    
    setIsClosing(true);
    setActionError(null);
    
    try {
      const response = await fetch(`/api/teacher/quizzes/${quiz.id}/close-attempt/${closingAttempt.attemptId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to close quiz');
      }
      
      setActionSuccess(`Quiz closed successfully for ${closingAttempt.studentName}!`);
      setClosingAttempt(null);
      router.refresh();
    } catch (err) {
      console.error("Error closing quiz:", err);
      setActionError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsClosing(false);
    }
  };

  const cancelAction = () => {
    setReopeningAttempt(null);
    setClosingAttempt(null);
    setActionError(null);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Top bar with quiz info and prominent average score */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/teacher/dashboard" className="text-blue-600 hover:underline">
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-1">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
            <p className="text-sm text-gray-500 mt-2">Created by: {quiz.teacher?.name ?? quiz.teacher?.email}</p>
          </div>

          {/* Prominent average score display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center min-w-[200px]">
            <p className="text-lg font-semibold text-gray-700">Average Score</p>
            <p className="text-5xl font-bold text-blue-600 mt-2">{averageScore.toFixed(1)}</p>
            <p className="text-gray-500 mt-1">out of {maxScore}</p>
          </div>
        </div>

        {/* Action buttons moved to top */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
          <Link 
            href={`/api/teacher/quizzes/${quiz.id}/export-results`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Results
          </Link>
          
          <button 
            onClick={() => setIsAnalyticsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Detailed Analytics
          </button>
          <button 
            onClick={() => setIsStudentAnalysisModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Student Analysis
          </button>
        </div>
      </div>

      {/* Success/Error Notification */}
      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-green-700 hover:text-green-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Average Score</h3>
          <p className="text-2xl font-bold text-blue-600">{averageScore.toFixed(1)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Highest Score</h3>
          <p className="text-2xl font-bold text-green-600">{highestScore}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Lowest Score</h3>
          <p className="text-2xl font-bold text-red-600">{lowestScore}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Avg Focus Loss</h3>
          <p className="text-2xl font-bold text-purple-600">{averageFocusLoss.toFixed(1)}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Student Attempts ({quiz.attempts.length})</h2>

      {quiz.attempts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">No students have submitted this quiz yet.</p>
          <Link href="/teacher/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column - Student Attempts List (30% width) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Student List</h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {attemptsWithScores.map(({ attempt, score }) => {
                    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                    let scoreColor = "text-red-600";
                    if (percentage >= 80) scoreColor = "text-green-600";
                    else if (percentage >= 60) scoreColor = "text-yellow-600";
                    
                    return (
                      <li key={attempt.id} className="p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{attempt.student?.name ?? attempt.student?.email}</p>
                            <p className="text-xs text-gray-500">
                              {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "Unknown"}
                            </p>
                            <div className="mt-1 flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                attempt.focusLossCount === 0 ? 'bg-green-100 text-green-800' :
                                attempt.focusLossCount <= 2 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Focus: {attempt.focusLossCount}
                              </span>
                            </div>
                          </div>

                          <div className="text-right ml-2">
                            <div className="flex items-center gap-1">
                              <p className={`font-semibold ${scoreColor}`}>{score}/{maxScore}</p>
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                percentage >= 80 ? 'bg-green-100 text-green-800' :
                                percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="mt-1 flex flex-col gap-1">
                              <Link 
                                href={`/teacher/quizzes/${quiz.id}/attempt/${attempt.id}`} 
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Review
                              </Link>
                              
                              {/* Toggle button based on submission status */}
                              {attempt.isSubmitted ? (
                                <button
                                  onClick={() => handleReopenQuiz(attempt.id, attempt.student?.name || attempt.student?.email || "Unknown")}
                                  className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Reopen Quiz
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCloseQuiz(attempt.id, attempt.student?.name || attempt.student?.email || "Unknown")}
                                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                                >
                                  <Lock className="w-3 h-3" />
                                  Close Quiz
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Score Distribution (70% width) */}
          <div className="lg:col-span-7">
            <ChartAndButtons
              studentScores={studentScores}
              maxScore={maxScore}
              totalFocusLosses={totalFocusLosses}
              averageFocusLoss={averageFocusLoss}
              maxFocusLoss={maxFocusLoss}
              noFocusLossCount={noFocusLossCount}
              lowFocusLossCount={lowFocusLossCount}
              highFocusLossCount={highFocusLossCount}
              focusLossCounts={focusLossCounts}
              quizAttemptsCount={quiz.attempts.length}
              scores={studentScores.map(s => s.score)}
            />
          </div>
        </div>
      )}

      {/* Detailed Analytics Modal */}
      {isAnalyticsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detailed Analytics for {quiz.title}</h2>
                <button 
                  onClick={() => setIsAnalyticsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Score Performance */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Score Performance</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Average Score</span>
                        <span className="text-sm font-medium">{averageScore.toFixed(1)} / {maxScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(averageScore / maxScore) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Highest Score</span>
                        <span className="text-sm font-medium">{highestScore} / {maxScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(highestScore / maxScore) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Lowest Score</span>
                        <span className="text-sm font-medium">{lowestScore} / {maxScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(lowestScore / maxScore) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Score Distribution</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Excellent (80%+)</span>
                        <span className="text-sm font-medium">{scoreRanges.excellent} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(scoreRanges.excellent / quiz.attempts.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Good (60-79%)</span>
                        <span className="text-sm font-medium">{scoreRanges.good} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(scoreRanges.good / quiz.attempts.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Satisfactory (40-59%)</span>
                        <span className="text-sm font-medium">{scoreRanges.satisfactory} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${(scoreRanges.satisfactory / quiz.attempts.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Needs Improvement (&lt;40%)</span>
                        <span className="text-sm font-medium">{scoreRanges.needsImprovement} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(scoreRanges.needsImprovement / quiz.attempts.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Focus Loss Analysis */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold">Focus Loss Analysis</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">No Focus Loss</span>
                        <span className="text-sm font-medium">{noFocusLossCount} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(noFocusLossCount / quiz.attempts.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Low Focus Loss (1-2)</span>
                        <span className="text-sm font-medium">{lowFocusLossCount} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${(lowFocusLossCount / quiz.attempts.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">High Focus Loss (3+)</span>
                        <span className="text-sm font-medium">{highFocusLossCount} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(highFocusLossCount / quiz.attempts.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-yellow-100">
                      <p className="text-sm">Average Focus Loss: <span className="font-medium">{averageFocusLoss.toFixed(1)}</span></p>
                    </div>
                  </div>
                </div>

                {/* Submission Time Analysis */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Submission Time Analysis</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded">
                        <p className="text-xs text-gray-500">Average Time</p>
                        <p className="font-semibold">{averageSubmissionTime.toFixed(0)} min</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-xs text-gray-500">Fastest Submission</p>
                        <p className="font-semibold">{fastestSubmission} min</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-xs text-gray-500">Slowest Submission</p>
                        <p className="font-semibold">{slowestSubmission} min</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-xs text-gray-500">Total Attempts</p>
                        <p className="font-semibold">{quiz.attempts.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-red-50 p-4 rounded-lg md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold">Recommendations</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {scoreRanges.needsImprovement > quiz.attempts.length * 0.3 && (
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span>Consider reviewing the quiz content as {((scoreRanges.needsImprovement / quiz.attempts.length) * 100).toFixed(0)}% of students scored below 40%</span>
                      </li>
                    )}
                    {highFocusLossCount > quiz.attempts.length * 0.3 && (
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span>{((highFocusLossCount / quiz.attempts.length) * 100).toFixed(0)}% of students had high focus loss - consider shortening the quiz or adding breaks</span>
                      </li>
                    )}
                    {averageSubmissionTime > quiz.duration * 0.8 && (
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span>Students are taking most of the allotted time - consider if the quiz is too long or difficult</span>
                      </li>
                    )}
                    {scoreRanges.excellent > quiz.attempts.length * 0.7 && (
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Great job! {((scoreRanges.excellent / quiz.attempts.length) * 100).toFixed(0)}% of students scored 80% or higher</span>
                      </li>
                    )}
                    {noFocusLossCount > quiz.attempts.length * 0.7 && (
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Excellent focus! {((noFocusLossCount / quiz.attempts.length) * 100).toFixed(0)}% of students had no focus loss</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setIsAnalyticsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Analysis Modal */}
      <StudentAnalysisModal
        isOpen={isStudentAnalysisModalOpen}
        onClose={() => setIsStudentAnalysisModalOpen(false)}
        quizTitle={quiz.title}
        maxScore={maxScore}
        excellentStudents={excellentStudents}
        goodStudents={goodStudents}
        needsImprovementStudents={needsImprovementStudents}
      />

      {/* Unified Action Confirmation Modal */}
      {(reopeningAttempt || closingAttempt) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {reopeningAttempt ? "Reopen Quiz" : "Close Quiz"}
                </h3>
                <button 
                  onClick={cancelAction}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">
                  {reopeningAttempt 
                    ? `Are you sure you want to reopen the quiz for ${reopeningAttempt.studentName}? This will allow the student to continue from where they left off.`
                    : `Are you sure you want to close the quiz for ${closingAttempt?.studentName}? This will submit the quiz and the student will not be able to make further changes.`
                  }
                </p>
              </div>

              {actionError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {actionError}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelAction}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={reopeningAttempt ? confirmReopenQuiz : confirmCloseQuiz}
                  disabled={isReopening || isClosing}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    reopeningAttempt 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {isReopening || isClosing 
                    ? (reopeningAttempt ? "Reopening..." : "Closing...") 
                    : (reopeningAttempt ? "Reopen Quiz" : "Close Quiz")
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}