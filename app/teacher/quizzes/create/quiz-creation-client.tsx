"use client";

import { useState, useEffect } from "react";
import { createQuiz } from "@/app/teacher/quizzes/actions";
import QuestionEditor, {
  extractContentAndImage,
} from "@/components/QuestionEditor";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";


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

const yearGroupClasses: Record<string, string[]> = {
   "Year 7": ["Year 7 FAL", "Year 7 MMA"],
    "Year 8": ["Year 8 AMQ", "Year 8 SAG"],
    "Year 9": ["Year 9 AMA", "Year 9 CAD"],
    "Year 10": ["Year 10 NOI", "Year 10 ZAB"],
    "Year 11": ["Year 11 AMU", "Year 11 MAL"],
};

// add near top of file (above the component)
type CreateQuizResult =
  | { success: true; quizId?: string } // server returns created id optionally
  | { success: false; error: string }  // server returns an error message


function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export default function QuizCreationClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [yearGroup, setYearGroup] = useState("");
  const [className, setClassName] = useState("");
  const [academicYear, setAcademicYear] = useState("2023-2024");
  const [term, setTerm] = useState("AUTUMN");
  const [subterm, setSubterm] = useState("MIDTERM");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Add state for date and time
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  // Initialize with a single empty question on component mount
  useEffect(() => {
    setQuestions([
      {
        id: crypto.randomUUID(),
        text: "",
        imageUrl: null,
        type: "OPTIONS",
        points: 1,
        correctAnswer: "",
        options: [
          {
            id: crypto.randomUUID(),
            text: "",
            imageUrl: null,
            isCorrect: false,
          },
        ],
      },
    ]);
  }, []);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: "",
        imageUrl: null,
        type: "OPTIONS",
        points: 1,
        correctAnswer: "",
        options: [
          {
            id: crypto.randomUUID(),
            text: "",
            imageUrl: null,
            isCorrect: false,
          },
        ],
      },
    ]);
  };

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                {
                  id: crypto.randomUUID(),
                  text: "",
                  imageUrl: null,
                  isCorrect: false,
                },
              ],
            }
          : q
      )
    );
  };

  const handleQuestionChange = (
    questionId: string,
    field: string,
    value: any
  ) => {
    if (field === "editorContent") {
      const { text, imageUrl } = extractContentAndImage(value);
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, text, imageUrl } : q))
      );
    } else {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
      );
    }
  };

  const handleOptionChange = (
    questionId: string,
    optionId: string,
    field: keyof Option,
    value: any
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, [field]: value } : o
              ),
            }
          : q
      )
    );
  };

  const handleOptionImageUpload = (
    questionId: string,
    optionId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleOptionChange(
          questionId,
          optionId,
          "imageUrl",
          reader.result as string
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // add near top of file (above the component)
type CreateQuizResult =
  | { success: true; quizId?: string } // server returns created id optionally
  | { success: false; error: string }  // server returns an error message

// inside your component, replace the handleSubmit with:
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const formData = new FormData(e.currentTarget);
    formData.append("questions", JSON.stringify(questions));
    formData.append("yearGroup", yearGroup);
    formData.append("className", className);
    // Add these lines to include academic fields
    formData.append("academicYear", academicYear);
    formData.append("term", term);
    formData.append("subterm", subterm);
    
    // Combine date and time into a single datetime string
    if (startDate && startTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      formData.append("startDateTime", startDateTime);
    }

    // NOTE: cast the return to the union type we declared above
    const result = (await createQuiz(formData)) as CreateQuizResult;

    // Narrow: error case
    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Narrow: success case (result.success === true)
    if (result.success) {
      // optional quizId provided by server -> navigate there
      if ("quizId" in result && result.quizId) {
        router.replace(`/teacher/quizzes/edit/${result.quizId}`);
        return;
      }

      // fallback success navigation
      router.replace("/teacher/dashboard");
      return;
    }

    // Fallback: unexpected shape
    setError("Unexpected response from server");
  } catch (err: any) {
    console.error("createQuiz error", err);
    setError(err?.message || "An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-8 my-10">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      <div className="flex gap-4">
              {/* Academic Year, Term, and Subterm Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Academic Year</label>
          <select
            name="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="border rounded w-full p-2"
            required
          >
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Term</label>
          <select
            name="term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="border rounded w-full p-2"
            required
          >
            <option value="AUTUMN">Autumn</option>
            <option value="SPRING">Spring</option>
            <option value="SUMMER">Summer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Subterm</label>
          <select
            name="subterm"
            value={subterm}
            onChange={(e) => setSubterm(e.target.value)}
            className="border rounded w-full p-2"
            required
          >
            <option value="MIDTERM">Midterm</option>
            <option value="END_OF_TERM">End of Term</option>
          </select>
        </div>
      </div>
        {/* Year Group */}
        <div>
          <label className="block text-sm font-medium">Year Group</label>
          <select
            name="yearGroup"
            value={yearGroup}
            onChange={(e) => {
              setYearGroup(e.target.value);
              setClassName(""); // reset class when year changes
            }}
            className="border rounded w-full p-2"
            required
          >
            <option value="">Select Year Group</option>
            {Object.keys(yearGroupClasses).map((yg) => (
              <option key={yg} value={yg}>
                {yg}
              </option>
            ))}
          </select>
        </div>

        {/* Class Name (dependent on year group) */}
        <div>
          <label className="block text-sm font-medium">Class</label>
          <select
            name="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="border rounded w-full p-2"
            required
            disabled={!yearGroup}
          >
            <option value="">Select Class</option>
            {yearGroup &&
              yearGroupClasses[yearGroup].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="flex bg-white p-6 rounded-lg shadow-md gap-4">
        <label className="block text-lg font-medium">
          Quiz Title
          <input
            type="text"
            name="title"
            placeholder="Enter quiz title"
            className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </label>

        <label className="block text-lg font-medium">
          Description
          <textarea
            name="description"
            placeholder="Brief description of the quiz"
            className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          ></textarea>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-lg font-medium">
            Start Date
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label className="block text-lg font-medium">
            Start Time
            <input
              type="time"
              name="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

        <label className="block text-lg font-medium">
          Duration (minutes)
          <input
            type="number"
            name="duration"
            min="1"
            placeholder="e.g. 60"
            className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </label>
      </div>

      {questions.map((q, qIndex) => (
        <div key={q.id} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-semibold">Question {qIndex + 1}</h3>

          <label className="block font-medium">Question Text</label>
          <QuestionEditor
            value={q.text}
            onChange={(content) =>
              handleQuestionChange(q.id, "editorContent", content)
            }
          />

          <label className="block font-medium">Question Type</label>
          <select
            value={q.type}
            onChange={(e) => handleQuestionChange(q.id, "type", e.target.value)}
            className="border p-2 rounded-md"
          >
            <option value="OPTIONS">Multiple Choice (Single Answer)</option>
            <option value="CHECKBOX">Multiple Choice (Multiple Answers)</option>
            <option value="PARAGRAPH">Paragraph</option>
            <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
          </select>

          <label className="block font-medium">Points</label>
          <input
            type="number"
            value={q.points}
            onChange={(e) =>
              handleQuestionChange(q.id, "points", Number(e.target.value))
            }
            className="border p-2 rounded-md"
          />

          {(q.type === "OPTIONS" || q.type === "CHECKBOX") && (
            <div className="space-y-2">
              {q.options.map((o) => (
                <div key={o.id} className="flex items-center space-x-2">
                  <input
                    type={q.type === "OPTIONS" ? "radio" : "checkbox"}
                    name={`correct-option-${q.id}`}
                    checked={o.isCorrect}
                    onChange={() =>
                      handleOptionChange(q.id, o.id, "isCorrect", !o.isCorrect)
                    }
                  />
                  <input
                    type="text"
                    value={o.text}
                    onChange={(e) =>
                      handleOptionChange(q.id, o.id, "text", e.target.value)
                    }
                    className="flex-grow p-2 border rounded-md"
                    placeholder="Option Text"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleOptionImageUpload(q.id, o.id, e)}
                    className="flex-shrink-0"
                  />
                  {o.imageUrl && (
                    <img
                      src={o.imageUrl}
                      alt="Option preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(q.id)}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Add Option
              </button>
            </div>
          )}

          {q.type === "FILL_IN_THE_BLANK" && (
            <input
              type="text"
              value={q.correctAnswer}
              onChange={(e) =>
                handleQuestionChange(q.id, "correctAnswer", e.target.value)
              }
              className="w-full p-2 border rounded-md"
              placeholder="Correct Answer"
            />
          )}

          {q.type === "PARAGRAPH" && (
            <textarea
              value={q.correctAnswer}
              onChange={(e) =>
                handleQuestionChange(q.id, "correctAnswer", e.target.value)
              }
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Model Answer (optional)"
            />
          )}
        </div>
      ))}
      

      <div className="flex justify-between">
        <button
          type="button"
          onClick={addQuestion}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Question
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}