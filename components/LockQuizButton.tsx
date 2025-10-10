"use client";

import { useFormStatus } from "react-dom";
import { toggleQuizLock } from "@/app/admin/quizzes/actions";

interface LockQuizButtonProps {
  quizId: string;
  canTeacherEdit: boolean;
}

export default function LockQuizButton({
  quizId,
  canTeacherEdit,
}: LockQuizButtonProps) {
  const { pending } = useFormStatus();

  return (
    <form action={toggleQuizLock} className="inline-block">
      <input type="hidden" name="quizId" value={quizId} />
      {/* Send the current state, not the toggled state */}
      <input
        type="hidden"
        name="canTeacherEdit"
        value={canTeacherEdit.toString()}
      />
      <button
        type="submit"
        disabled={pending}
        className={`px-4 py-2 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors
          ${
            canTeacherEdit
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
      >
        {pending
          ? "Updating..."
          : canTeacherEdit
          ? "Lock for Teachers"
          : "Unlock for Teachers"}
      </button>
    </form>
  );
}
