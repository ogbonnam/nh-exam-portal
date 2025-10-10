// app/not-found.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

// Create a separate client component for the back button
function BackButton() {
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

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/learning.jpg"
          alt="404 background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-purple-900/60 to-violet-900/80"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>

      {/* 404 Content */}
      <div className="relative z-10 text-center px-4">
        <div className="max-w-2xl mx-auto">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto">
              The page you're looking for seems to have vanished into the
              digital void. Let's get you back on track!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </Link>

            <BackButton />
          </div>

          {/* Search Suggestion */}
          <div className="mt-12">
            <p className="text-gray-400 mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Quizzes", href: "/quizzes" },
                { label: "Profile", href: "/profile" },
                { label: "Help", href: "/help" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-block px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Animated Astronaut */}
      <div className="absolute bottom-10 left-10 z-10 hidden lg-block">
        <svg
          className="w-32 h-32 text-white/30 animate-float"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-gray-400 text-sm z-10">
        <p>
          © {new Date().getFullYear()} QuizMaster Pro. Lost in space? We'll help
          you find your way.
        </p>
      </div>
    </div>
  );
}
