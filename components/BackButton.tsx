// components/BackButton.tsx
"use client";

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Go Back
    </button>
  );
}
