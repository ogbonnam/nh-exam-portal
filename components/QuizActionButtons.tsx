// components/QuizActionButtons.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function QuizActionButtons() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCreateQuiz = () => {
    setIsCreating(true);
    // Simulate a brief delay to show the loading state
    setTimeout(() => {
      router.push("/teacher/quizzes/create");
    }, 500);
  };

  const handleUploadQuiz = () => {
    setIsUploading(true);
    // Simulate a brief delay to show the loading state
    setTimeout(() => {
      router.push("/teacher/quizzes/upload");
    }, 500);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCreateQuiz}
        disabled={isCreating}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-75 flex items-center"
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Quiz...
          </>
        ) : (
          "Create New Quiz"
        )}
      </button>
      <button
        onClick={handleUploadQuiz}
        disabled={isUploading}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-75 flex items-center"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Going to Upload Page...
          </>
        ) : (
          "Upload Quiz"
        )}
      </button>
    </div>
  );
}