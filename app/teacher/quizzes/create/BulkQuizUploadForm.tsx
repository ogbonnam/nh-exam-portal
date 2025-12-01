"use client";

import { useState } from "react";
import { uploadQuizDocxWithImages } from "@/app/teacher/quizzes/actions";
import { useFormStatus } from "react-dom";

interface Option {
  id: string;
  text: string;
  imageUrl: string | null;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  imageUrl: string | null;
  type: "OPTIONS" | "CHECKBOX" | "PARAGRAPH" | "FILL_IN_THE_BLANK";
  points: number;
  correctAnswer: string;
  options: Option[];
}

export default function BulkQuizUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { pending } = useFormStatus();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a .docx file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Optional: you can append quiz metadata here
      formData.append("title", "Preview Quiz");
      formData.append("description", "Uploaded via bulk form");
      formData.append("yearGroup", "Year 7");
      formData.append("className", "Year 7 AMA");
      formData.append("duration", "60");
      formData.append("startDate", new Date().toISOString().split("T")[0]);
      formData.append("startTime", "08:00");

      const result = await uploadQuizDocxWithImages(formData);

      if (result.success && result.quizId) {
        setQuestions(result.questions); // Preview questions immediately
      } else {
        setError("Failed to parse the file");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      {error && <div className="text-red-600">{error}</div>}

      <input type="file" accept=".docx" onChange={handleFileChange} />
      <button
        type="button"
        onClick={handleUpload}
        disabled={loading || pending}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {loading ? "Parsing..." : "Upload & Preview"}
      </button>

      {questions.length > 0 && (
        <div className="mt-4 space-y-6">
          <h3 className="text-xl font-semibold">Preview Questions</h3>
          {questions.map((q, idx) => (
            <div key={q.id} className="border p-4 rounded-md">
              <p className="font-medium">
                Q{idx + 1}: {q.text}
              </p>
              <p>Type: {q.type}</p>
              <p>Points: {q.points}</p>
              {q.options && q.options.length > 0 && (
                <ul className="ml-4 list-disc">
                  {q.options.map((o) => (
                    <li key={o.id} className="flex items-center gap-2">
                      <span>{o.text}</span>
                      {o.imageUrl && (
                        <img
                          src={o.imageUrl}
                          alt="Option"
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      {o.isCorrect && (
                        <span className="ml-2 text-green-600 font-semibold">
                          ✔
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
