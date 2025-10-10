"use client";

import { useFormStatus } from "react-dom"; // Corrected import
import { toggleQuizPublished } from "@/app/admin/quizzes/actions";

interface PublishQuizButtonProps {
  quizId: string;
  isPublished: boolean;
}

export default function PublishQuizButton({
  quizId,
  isPublished,
}: PublishQuizButtonProps) {
  const { pending } = useFormStatus();

  return (
    <form action={toggleQuizPublished} className="inline-block">
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="isPublished" value={isPublished.toString()} />
      <button
        type="submit"
        disabled={pending}
        className={`px-4 py-2 rounded-md font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors
          ${
            isPublished
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
      >
        {pending ? "Updating..." : isPublished ? "Unpublish" : "Publish"}
      </button>
    </form>
  );
}
