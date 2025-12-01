// app/teacher/quizzes/upload/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/auth";

export default function UploadQuizPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [yearGroup, setYearGroup] = useState("Year 7");
  const [className, setClassName] = useState("Year 7 FAL"); // Changed default to match first option
  const [academicYear, setAcademicYear] = useState("2023-2024");
  const [term, setTerm] = useState("AUTUMN");
  const [subterm, setSubterm] = useState("MIDTERM");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("duration", duration.toString());
      formData.append("yearGroup", yearGroup);
      formData.append("className", className);
      formData.append("academicYear", academicYear);
      formData.append("term", term);
      formData.append("subterm", subterm);

      const response = await fetch("/api/teacher/quizzes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/teacher/quizzes/edit/${data.quizId}`);
      } else {
        setError(data.message || "Failed to upload quiz");
      }
    } catch (err) {
      setError("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Upload Quiz from Word Document</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quiz Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Group
            </label>
            <select
              value={yearGroup}
              onChange={(e) => setYearGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Year 7">Year 7</option>
              <option value="Year 8">Year 8</option>
              <option value="Year 9">Year 9</option>
              <option value="Year 10">Year 10</option>
              <option value="Year 11">Year 11</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {/* Fixed: value attributes now match the displayed text */}
            <option value="Year 7 FAL">Year 7 FAL</option>
            <option value="Year 7 MMA">Year 7 MMA</option>
            <option value="Year 8 SAG">Year 8 SAG</option>
            <option value="Year 8 AMQ">Year 8 AMQ</option>
            <option value="Year 9 NOI">Year 9 NOI</option>
            <option value="Year 9 ZAB">Year 9 ZAB</option>
            <option value="Year 10 MAL">Year 10 MAL</option>
            <option value="Year 10 AMU">Year 10 AMU</option>
            <option value="Year 11 ZAK">Year 11 ZAK</option>
            <option value="Year 11 LDK">Year 11 LDK</option>
          </select>
        </div>

        {/* Academic Year, Term, and Subterm Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="AUTUMN">Autumn</option>
              <option value="SPRING">Spring</option>
              <option value="SUMMER">Summer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subterm
            </label>
            <select
              value={subterm}
              onChange={(e) => setSubterm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="MIDTERM">Midterm</option>
              <option value="END_OF_TERM">End of Term</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Word Document (.docx)
          </label>
          <input
            type="file"
            accept=".docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Please format your document with questions and options as described in the instructions.
          </p>
        </div>

        {error && (
          <div className="text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload Quiz"}
        </button>
      </form>
    </div>
  );
}