// app/teacher/quizzes/[quizId]/results/StudentAnalysisModal.tsx
"use client";

import React from "react";
import { X, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { QuizAttempt } from "@prisma/client";

type StudentAnalysisModalProps = {
  isOpen: boolean;
  onClose: () => void;
  quizTitle: string;
  maxScore: number;
  excellentStudents: { name: string; score: number; percentage: number; attempt: QuizAttempt }[];
  goodStudents: { name: string; score: number; percentage: number; attempt: QuizAttempt }[];
  needsImprovementStudents: { name: string; score: number; percentage: number; attempt: QuizAttempt }[];
};

export default function StudentAnalysisModal({
  isOpen,
  onClose,
  quizTitle,
  maxScore,
  excellentStudents,
  goodStudents,
  needsImprovementStudents
}: StudentAnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Student Performance Analysis - {quizTitle}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Excellent Students (80%+) */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Excellent Performers (80%+)</h3>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-bold text-green-600">{excellentStudents.length}</span>
                <span className="text-gray-600 ml-2">students</span>
              </div>
              
              {excellentStudents.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {excellentStudents.map((student, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            {student.attempt.submittedAt 
                              ? new Date(student.attempt.submittedAt).toLocaleDateString() 
                              : "Unknown date"
                            }
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Focus: {student.attempt.focusLossCount}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Time: {student.attempt.submittedAt && student.attempt.startedAt 
                                ? `${Math.round((new Date(student.attempt.submittedAt).getTime() - new Date(student.attempt.startedAt).getTime()) / 60000)} min` 
                                : "N/A"
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{student.score}/{maxScore}</p>
                          <p className="text-sm text-green-600">{student.percentage}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No students in this category</p>
              )}
            </div>

            {/* Good Students (60-79%) */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Good Performers (60-79%)</h3>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-bold text-blue-600">{goodStudents.length}</span>
                <span className="text-gray-600 ml-2">students</span>
              </div>
              
              {goodStudents.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {goodStudents.map((student, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            {student.attempt.submittedAt 
                              ? new Date(student.attempt.submittedAt).toLocaleDateString() 
                              : "Unknown date"
                            }
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Focus: {student.attempt.focusLossCount}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Time: {student.attempt.submittedAt && student.attempt.startedAt 
                                ? `${Math.round((new Date(student.attempt.submittedAt).getTime() - new Date(student.attempt.startedAt).getTime()) / 60000)} min` 
                                : "N/A"
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{student.score}/{maxScore}</p>
                          <p className="text-sm text-blue-600">{student.percentage}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No students in this category</p>
              )}
            </div>

            {/* Students Needing Improvement (<60%) */}
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Needs Improvement (&lt;60%)</h3>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-bold text-red-600">{needsImprovementStudents.length}</span>
                <span className="text-gray-600 ml-2">students</span>
              </div>
              
              {needsImprovementStudents.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {needsImprovementStudents.map((student, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            {student.attempt.submittedAt 
                              ? new Date(student.attempt.submittedAt).toLocaleDateString() 
                              : "Unknown date"
                            }
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Focus: {student.attempt.focusLossCount}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Time: {student.attempt.submittedAt && student.attempt.startedAt 
                                ? `${Math.round((new Date(student.attempt.submittedAt).getTime() - new Date(student.attempt.startedAt).getTime()) / 60000)} min` 
                                : "N/A"
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{student.score}/{maxScore}</p>
                          <p className="text-sm text-red-600">{student.percentage}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No students in this category</p>
              )}
            </div>
          </div>

          {/* Intervention Recommendations */}
          {needsImprovementStudents.length > 0 && (
            <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Intervention Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Immediate Actions:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Schedule one-on-one sessions with struggling students</li>
                    <li>Provide additional practice materials</li>
                    <li>Consider peer tutoring options</li>
                    <li>Review quiz questions for clarity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Long-term Strategies:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Implement differentiated instruction</li>
                    <li>Adjust teaching methods based on feedback</li>
                    <li>Create study groups with mixed abilities</li>
                    <li>Monitor progress with regular check-ins</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}