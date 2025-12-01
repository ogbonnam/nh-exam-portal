// app/student/dashboard/QuizStartModal.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {
  quizId: string;
  onClose: () => void;
};

export default function QuizStartModal({ quizId, onClose }: Props) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing quiz...");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, text: "Loading questions..." },
      { progress: 40, text: "Preparing quiz environment..." },
      { progress: 60, text: "Setting up timer..." },
      { progress: 80, text: "Finalizing preparations..." },
      { progress: 100, text: "Ready to start!" }
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setProgress(step.progress);
        setLoadingText(step.text);
        currentStep++;
        
        if (currentStep === loadingSteps.length) {
          setIsComplete(true);
          clearInterval(interval);
          
          // Redirect to quiz page after a short delay
          setTimeout(() => {
            router.push(`/student/quiz/${quizId}`);
          }, 1000);
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [quizId, router]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Starting Quiz</h3>
          <p className="text-gray-600 mb-6">{loadingText}</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Progress percentage */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span className="font-medium text-indigo-600">{progress}%</span>
            <span>100%</span>
          </div>
        </div>
        
        {isComplete && (
          <div className="bg-green-50 p-4 border-t border-green-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-green-700 font-medium">Quiz ready! Redirecting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}