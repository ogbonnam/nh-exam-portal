// components/Header.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutForm from "./LogoutForm";
import Image from "next/image";

interface HeaderProps {
  userRole: string | null;
  session: any;
}

export default function Header({ userRole, session }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    switch (userRole) {
      case "ADMIN":
        return "/admin/users";
      case "TEACHER":
        return "/teacher/dashboard";
      case "STUDENT":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  const getDashboardLabel = () => {
    switch (userRole) {
      case "ADMIN":
        return "Admin Panel";
      case "TEACHER":
        return "Teacher Dashboard";
      case "STUDENT":
        return "Student Dashboard";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Spacer to prevent content overlap */}
      
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          isScrolled
            ? "bg-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "bg-gray-900/80 backdrop-blur-lg"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center min-h-[48px]">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-3 flex-shrink-0"
            >
              <div className="w-12 h-12 rounded-xl  flex items-center justify-center ">
              <Image 
                src="/images/NH.png"
                height={50}
                width={50}
                alt="logo"
              />
              </div>
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
              >
                NoHLAG Exams
              </Link>
            </motion.div>

            {/* Navigation - Fixed width container */}
            <nav className="flex items-center justify-end flex-1 ml-8">
              <div className="flex items-center space-x-4">
                {session?.user ? (
                  // Logged in state
                  <>
                    {userRole && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                        <Link
                          href={getDashboardLink()}
                          className="relative px-6 py-2.5 bg-gray-800 rounded-lg font-medium text-white flex items-center space-x-2 border border-white/10 hover:border-white/20 transition-all whitespace-nowrap"
                        >
                          <svg
                            className="w-5 h-5 flex-shrink-0"
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
                          <span>{getDashboardLabel()}</span>
                        </Link>
                      </motion.div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div className="hidden lg:flex items-center space-x-3 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-5 py-2.5 rounded-xl border border-white/10 shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                          {session.user.name?.charAt(0) || "U"}
                        </div>
                        <div className="pr-3 border-r border-white/20 h-8"></div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {session.user.name}
                          </div>
                          <div className="text-xs text-purple-300 capitalize">{userRole}</div>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogoutForm />
                      </motion.div>
                    </div>
                  </>
                ) : (
                  // Logged out state
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <Link
                      href="/login"
                      className="relative px-8 py-2.5 bg-gray-900 rounded-lg font-medium text-white border border-white/10 hover:border-white/20 transition-all flex items-center space-x-2 whitespace-nowrap"
                    >
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign In</span>
                    </Link>
                  </motion.div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </motion.header>
    </>
  );
}