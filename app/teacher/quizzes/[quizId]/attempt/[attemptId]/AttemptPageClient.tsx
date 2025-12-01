// app/teacher/quizzes/[quizId]/attempt/[attemptId]/AttemptPageClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { QuizAttempt, Question, UserAnswer, User, Option, QuestionType } from "@prisma/client";

type QuestionWithAnswers = Question & {
  options: Option[];
  userAnswer?: {
    id: string;
    textAnswer: string | null;
    optionIds: string[];
    isCorrect: boolean | null;
    submittedAt: Date;
    studentId: string;
    questionId: string;
    attemptId: string;
    student: User;
  } | null;
  isCorrect?: boolean; // Changed to boolean | undefined to match server component
};

type QuizAttemptWithDetails = QuizAttempt & {
  student: User;
  quiz: {
    id: string;
    title: string;
    description: string | null;
    teacherId: string;
    questions: QuestionWithAnswers[];
  };
};

export default function AttemptPageClient({
  attempt,
  questionsWithAnswers,
  initialManualScores,
  maxScore,
  storedTotalScore,
}: {
  attempt: QuizAttemptWithDetails;
  questionsWithAnswers: QuestionWithAnswers[];
  initialManualScores: Record<string, number>;
  maxScore: number;
  storedTotalScore: number | null;
}) {
  const [manualScores, setManualScores] = useState<Record<string, number>>(initialManualScores);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false); // For debugging
  
  const router = useRouter();

  // Use the stored total score if available, otherwise calculate from manualScores
  const totalScore = storedTotalScore !== null ? storedTotalScore : Object.values(manualScores).reduce((sum, score) => sum + score, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const handleManualScoreChange = (questionId: string, score: number) => {
    setManualScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const saveGrades = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      // Call API to save grades
      const response = await fetch(`/api/student/updated-grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          attemptId: attempt.id,
          manualScores 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save grades');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving grades:", err);
      setError("Failed to save grades.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Debug button - remove in production */}
      <div className="mb-4">
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs bg-gray-200 px-2 py-1 rounded"
        >
          {showDebug ? "Hide Debug" : "Show Debug"}
        </button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/teacher/quizzes/${attempt.quizId}/results`} className="text-blue-600 hover:underline">
              ← Back to Results
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-1">{attempt.quiz.title}</h1>
          <p className="text-gray-600">{attempt.quiz.description}</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <p>Student: <strong>{attempt.student?.name ?? attempt.student?.email}</strong></p>
            <p>Submitted: <strong>{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "Unknown"}</strong></p>
            <p>Focus Loss: <strong>{attempt.focusLossCount}</strong></p>
          </div>
        </div>

        <div className="text-right">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total Score</p>
            <p className="text-3xl font-bold">
              <span className={percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-yellow-600" : "text-red-600"}>
                {totalScore}/{maxScore}
              </span>
              <span className="text-lg ml-2">({percentage}%)</span>
            </p>
            {storedTotalScore !== null && (
              <p className="text-xs text-green-600 mt-1">Graded Score</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {questionsWithAnswers.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Question {index + 1} ({question.points} points)
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    Type: {question.type === QuestionType.OPTIONS ? "Multiple Choice" : 
                           question.type === QuestionType.CHECKBOX ? "Checkbox" :
                           question.type === QuestionType.FILL_IN_THE_BLANK ? "Fill in the Blank" :
                           "Paragraph"}
                  </span>
                  {question.isCorrect !== undefined && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      question.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {question.isCorrect ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Incorrect
                        </>
                      )}
                    </span>
                  )}
                  {question.isCorrect === undefined && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Not Graded
                    </span>
                  )}
                </div>
              </div>

              {/* Show score input for ALL questions */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Score:
                </label>
                <input
                  type="number"
                  min="0"
                  max={question.points || 1}
                  value={manualScores[question.id] || 0}
                  onChange={(e) => handleManualScoreChange(question.id, parseInt(e.target.value) || 0)}
                  className="w-20 p-2 border border-gray-300 rounded-md"
                />
                <span className="text-sm text-gray-500">
                  / {question.points || 1}
                </span>
              </div>
            </div>

            {/* Debug info - remove in production */}
            {showDebug && question.type === QuestionType.CHECKBOX && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Correct options: {question.options.filter(o => o.isCorrect).map(o => o.id).join(', ')}</p>
                <p>Selected options: {question.userAnswer?.optionIds?.join(', ') || 'None'}</p>
                <p>Is correct: {question.isCorrect !== undefined ? String(question.isCorrect) : 'undefined'}</p>
                <p>Stored isCorrect: {question.userAnswer?.isCorrect !== null ? String(question.userAnswer?.isCorrect) : 'null'}</p>
              </div>
            )}

            <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: question.text }} />
            
            {question.imageUrl && (
              <div className="mb-4">
                <img 
                  src={question.imageUrl} 
                  alt="Question" 
                  className="max-h-64 rounded-md border border-gray-200"
                />
              </div>
            )}

            {question.type === QuestionType.OPTIONS && (
              <div className="space-y-2">
                {question.options.map((option) => {
                  const isSelected = question.userAnswer?.optionIds?.includes(option.id);
                  const isCorrect = option.isCorrect;
                  
                  return (
                    <div 
                      key={option.id} 
                      className={`p-3 rounded-md border ${
                        isSelected && isCorrect ? "bg-green-50 border-green-300" :
                        isSelected && !isCorrect ? "bg-red-50 border-red-300" :
                        !isSelected && isCorrect ? "bg-yellow-50 border-yellow-300" :
                        "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border mr-2 ${
                          isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                        }`}></div>
                        <span>{option.text}</span>
                        {isCorrect && <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>}
                      </div>
                      {option.imageUrl && (
                        <img 
                          src={option.imageUrl} 
                          alt="Option" 
                          className="max-h-24 mt-2 rounded"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {question.type === QuestionType.CHECKBOX && (
              <div className="space-y-2">
                {question.options.map((option) => {
                  const isSelected = question.userAnswer?.optionIds?.includes(option.id);
                  const isCorrect = option.isCorrect;
                  
                  return (
                    <div 
                      key={option.id} 
                      className={`p-3 rounded-md border ${
                        isSelected && isCorrect ? "bg-green-50 border-green-300" :
                        isSelected && !isCorrect ? "bg-red-50 border-red-300" :
                        !isSelected && isCorrect ? "bg-yellow-50 border-yellow-300" :
                        "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded border mr-2 ${
                          isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                        }`}></div>
                        <span>{option.text}</span>
                        {isCorrect && <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>}
                      </div>
                      {option.imageUrl && (
                        <img 
                          src={option.imageUrl} 
                          alt="Option" 
                          className="max-h-24 mt-2 rounded"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {question.type === QuestionType.FILL_IN_THE_BLANK && (
              <div className="space-y-3">
                <div className="p-3 rounded-md border bg-gray-50">
                  <p className="font-medium">Student Answer:</p>
                  <p className="mt-1">{question.userAnswer?.textAnswer || "No answer provided"}</p>
                </div>
                <div className="p-3 rounded-md border bg-green-50">
                  <p className="font-medium">Correct Answer:</p>
                  <p className="mt-1">{question.correctAnswer}</p>
                </div>
              </div>
            )}

            {question.type === QuestionType.PARAGRAPH && (
              <div className="space-y-3">
                <div className="p-3 rounded-md border bg-gray-50">
                  <p className="font-medium">Student Answer:</p>
                  <p className="mt-1 whitespace-pre-wrap">{question.userAnswer?.textAnswer || "No answer provided"}</p>
                </div>
                <div className="p-3 rounded-md border bg-green-50">
                  <p className="font-medium">Model Answer:</p>
                  <p className="mt-1 whitespace-pre-wrap">{question.correctAnswer || "No model answer provided"}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8">
        <Link 
          href={`/teacher/quizzes/${attempt.quizId}/results`} 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Results
        </Link>
        
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-1" />
              <span>{error}</span>
            </div>
          )}
          
          {saveSuccess && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-1" />
              <span>Saved successfully</span>
            </div>
          )}
          
          <button
            onClick={saveGrades}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Grades"}
          </button>
        </div>
      </div>
    </div>
  );
}