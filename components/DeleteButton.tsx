"use client";

import { useFormStatus } from "react-dom";

interface DeleteButtonProps {
  // We'll pass the quizId as a prop now
  quizId: string;
}

export default function DeleteButton({ quizId }: DeleteButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
