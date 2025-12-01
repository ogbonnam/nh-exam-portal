// app/teacher/quizzes/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { QuestionType } from "@prisma/client";
import { updateQuiz } from "@/app/teacher/quizzes/actions";
import QuestionEditor, {
  extractContentAndImage,
} from "@/components/QuestionEditor";

interface Option {
  id?: string;
  text: string;
  imageUrl?: string | null;
  isCorrect: boolean;
}

interface Question {
  id?: string;
  text: string;
  imageUrl?: string | null;
  points: number;
  type: QuestionType;
  options: Option[];
  correctAnswer?: string | null;
}

interface EditQuizFormProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    startDate: Date | null;
    startTime: Date | null;
    yearGroup: string;
    className: string;
    academicYear: string;
    term: string;
    subterm: string;
    questions: {
      id: string;
      text: string;
      imageUrl: string | null;
      points: number;
      type: QuestionType;
      correctAnswer: string | null;
      options: {
        id: string;
        text: string;
        imageUrl: string | null;
        isCorrect: boolean;
      }[];
    }[];
  };
}

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

const yearGroupClasses: Record<string, string[]> = {
   "Year 7": ["Year 7 FAL", "Year 7 MMA"],
    "Year 8": ["Year 8 AMQ", "Year 8 SAG"],
    "Year 9": ["Year 9 AMA", "Year 9 CAD"],
    "Year 10": ["Year 10 NOI", "Year 10 ZAB"],
    "Year 11": ["Year 11 AMU", "Year 11 MAL"],};

export default function EditQuizForm({ quiz }: EditQuizFormProps) {
  const router = useRouter();
  const [yearGroup, setYearGroup] = useState(quiz.yearGroup);
  const [className, setClassName] = useState(quiz.className || "");
  const [academicYear, setAcademicYear] = useState(quiz.academicYear || "2023-2024");
  const [term, setTerm] = useState(quiz.term || "AUTUMN");
  const [subterm, setSubterm] = useState(quiz.subterm || "MIDTERM");
  
  const getStartTimeString = (date: Date | null) => {
    if (!date) return "";
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [questions, setQuestions] = useState<Question[]>(
    quiz.questions.map((q) => ({
      ...q,
      options: q.options.map((o) => ({ ...o })),
    }))
  );
  const [quizDetails, setQuizDetails] = useState({
    title: quiz.title,
    description: quiz.description || "",
    duration: quiz.duration,
    startDate: quiz.startDate?.toISOString().split("T")[0] || "",
    startTime: getStartTimeString(quiz.startTime),
    yearGroup: quiz.yearGroup || "Unknown",
    className: quiz.className || "Unknown",
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        points: 1,
        type: QuestionType.OPTIONS,
        options: [{ text: "", isCorrect: false }],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionContentChange = (index: number, content: string) => {
    const { text, imageUrl } = extractContentAndImage(content);
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    newQuestions[index].imageUrl = imageUrl;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    field: string,
    value: any
  ) => {
    const newQuestions = [...questions];
    const option = newQuestions[questionIndex].options[optionIndex];

    if (field === "isCorrect") {
      if (newQuestions[questionIndex].type === QuestionType.OPTIONS) {
        newQuestions[questionIndex].options.forEach(
          (o) => (o.isCorrect = false)
        );
        option.isCorrect = true;
      } else {
        option.isCorrect = value;
      }
    } else {
      (option as any)[field] = value;
    }

    setQuestions(newQuestions);
  };

  const startDateTime =
    quizDetails.startDate && quizDetails.startTime
      ? new Date(
          `${quizDetails.startDate}T${quizDetails.startTime}`
        ).toISOString()
      : "";

  return (
    <div className="container mx-auto p-4 my-10">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold">Edit Quiz: {quiz.title}</h1>
      </div>

      <form action={updateQuiz} className="space-y-8">
        <input type="hidden" name="quizId" value={quiz.id} />

        <input type="hidden" name="title" value={quizDetails.title} />
        <input
          type="hidden"
          name="description"
          value={quizDetails.description}
        />
        <input type="hidden" name="duration" value={quizDetails.duration} />
        <input type="hidden" name="startDateTime" value={startDateTime} />
        <input type="hidden" name="yearGroup" value={yearGroup} />
        <input type="hidden" name="className" value={className} />
        
        {/* Hidden inputs for academic fields */}
        <input type="hidden" name="academicYear" value={academicYear} />
        <input type="hidden" name="term" value={term} />
        <input type="hidden" name="subterm" value={subterm} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Year Group
            </label>
            <select
              name="yearGroup"
              value={yearGroup}
              onChange={(e) => {
                setYearGroup(e.target.value);
                const firstClass = yearGroupClasses[e.target.value]?.[0] || "";
                setClassName(firstClass);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Object.keys(yearGroupClasses).map((yg) => (
                <option key={yg} value={yg}>
                  {yg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Class Name
            </label>
            <select
              name="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {(yearGroupClasses[yearGroup] || []).map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Academic Year, Term, and Subterm Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="AUTUMN">Autumn</option>
              <option value="SPRING">Spring</option>
              <option value="SUMMER">Summer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subterm
            </label>
            <select
              value={subterm}
              onChange={(e) => setSubterm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="MIDTERM">Midterm</option>
              <option value="END_OF_TERM">End of Term</option>
            </select>
          </div>
        </div>

        <div className="flex bg-white p-6 rounded-lg shadow-md gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-lg font-medium text-gray-700"
            >
              Quiz Title
            </label>
            <input
              type="text"
              id="title"
              value={quizDetails.title}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              onChange={(e) =>
                setQuizDetails({ ...quizDetails, title: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={quizDetails.description}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              onChange={(e) =>
                setQuizDetails({ ...quizDetails, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                value={quizDetails.duration}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) =>
                  setQuizDetails({
                    ...quizDetails,
                    duration: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={quizDetails.startDate}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) =>
                  setQuizDetails({ ...quizDetails, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700"
              >
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                value={quizDetails.startTime}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) =>
                  setQuizDetails({ ...quizDetails, startTime: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-xl font-semibold">Questions</h2>
          {questions.map((question, qIndex) => {
            const initialEditorContent = question.imageUrl
              ? `<p>${question.text}</p><img src="${question.imageUrl}" />`
              : `<p>${question.text}</p>`;

            return (
              <div
                key={question.id || qIndex}
                className="p-4 border border-gray-200 rounded-md space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Question {qIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question Text
                  </label>
                  <div className="border border-gray-300 rounded-md">
                    <QuestionEditor
                      value={initialEditorContent}
                      onChange={(content) =>
                        handleQuestionContentChange(qIndex, content)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question Type
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "type", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value={QuestionType.OPTIONS}>
                      Multiple Choice
                    </option>
                    <option value={QuestionType.CHECKBOX}>Checkboxes</option>
                    <option value={QuestionType.FILL_IN_THE_BLANK}>
                      Fill in the Blank
                    </option>
                    <option value={QuestionType.PARAGRAPH}>Paragraph</option>
                  </select>
                </div>

                {/* Added Points Input Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Points
                  </label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "points", Number(e.target.value))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    min="1"
                    required
                  />
                </div>

                {question.type === QuestionType.OPTIONS ||
                question.type === QuestionType.CHECKBOX ? (
                  <div className="space-y-2">
                    <h4 className="text-md font-medium">Options</h4>
                    {question.options.map((option, oIndex) => (
                      <div
                        key={option.id || oIndex}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type={
                            question.type === QuestionType.OPTIONS
                              ? "radio"
                              : "checkbox"
                          }
                          name={`q-${qIndex}-correct-option`}
                          checked={option.isCorrect}
                          onChange={(e) =>
                            handleOptionChange(
                              qIndex,
                              oIndex,
                              "isCorrect",
                              e.target.checked
                            )
                          }
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) =>
                            handleOptionChange(
                              qIndex,
                              oIndex,
                              "text",
                              e.target.value
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add Option
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={question.correctAnswer || ""}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "correctAnswer",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Question
          </button>
        </div>

        <input
          type="hidden"
          name="questions"
          value={JSON.stringify(questions)}
        />
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}