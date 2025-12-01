// app/page.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaUsers,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaBookOpen,
  FaTrophy,
  FaRocket,
  FaBrain,
  FaAward,
  FaLightbulb,
  FaCode,
  FaStethoscope,
  FaBalanceScale,
  FaBriefcase,
  FaFlask,
  FaHistory,
  FaCalculator,
  FaQuoteLeft,
  FaQuoteRight,
  FaBars,
  FaTimes,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";

type Bubble = {
  width: number;
  height: number;
  top: string;
  left: string;
  animX: number;
  animY: number;
  duration: number;
  opacity: number;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[] | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const generated: Bubble[] = Array.from({ length: 20 }).map(() => {
      const width = Math.random() * 100 + 50;
      const height = Math.random() * 100 + 50;
      return {
        width,
        height,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animY: Math.random() * 100 - 50,
        animX: Math.random() * 100 - 50,
        duration: Math.random() * 10 + 10,
        opacity: Math.random() * 0.2 + 0.05,
      };
    });
    setBubbles(generated);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <FaCheckCircle className="text-3xl" />,
      title: "Instant Results",
      description:
        "Get immediate feedback and detailed analysis of your performance.",
      color: "bg-blue-500",
    },
    {
      icon: <FaClock className="text-3xl" />,
      title: "Time Tracking",
      description:
        "Monitor your progress and improve your time management skills.",
      color: "bg-green-500",
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "Performance Analytics",
      description:
        "Track your growth with comprehensive statistics and insights.",
      color: "bg-purple-500",
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Collaborative Learning",
      description:
        "Compete with friends and join study groups for better results.",
      color: "bg-rose-500",
    },
  ];

  const subjects = [
    { name: "Mathematics", icon: <FaCalculator /> },
    { name: "Science", icon: <FaFlask /> },
    { name: "Social Studies", icon: <FaHistory /> },
    { name: "Literature", icon: <FaBookOpen /> },
    { name: "ICT", icon: <FaCode /> },
    { name: "CRS", icon: <FaStethoscope /> },
    { name: "Business", icon: <FaBalanceScale /> },
    { name: "French", icon: <FaBriefcase /> },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  // Fixed the TypeScript error by properly typing the variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4 py-20">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {bubbles &&
            bubbles.map((b, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gray-800"
                style={{
                  width: b.width,
                  height: b.height,
                  top: b.top,
                  left: b.left,
                  opacity: b.opacity,
                }}
                initial={false}
                animate={{
                  y: [0, b.animY],
                  x: [0, b.animX],
                }}
                transition={{
                  duration: b.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gray-800 rounded-full border border-gray-700"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium">
              🚀 The Future of Education is Here
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Administer Any Exam
            <br />
            <span className="text-blue-400">Effortlessly</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Powerful exam management platform with AI-powered insights. Join thousands of educators creating effective assessments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-blue-600 rounded-full font-semibold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Login
              <FaArrowRight />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="px-4 py-2 bg-gray-800 rounded-full border border-gray-700 flex items-center gap-2 hover:bg-gray-700 transition-all cursor-pointer"
              >
                {subject.icon}
                <span>{subject.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for Effective Assessment
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with proven teaching methods to help you create impactful exams.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="bg-gray-700 rounded-2xl p-6 border border-gray-600 hover:bg-gray-600 transition-all"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-300">Educators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-gray-300">Question Types</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">95%</div>
              <div className="text-gray-300">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">4.9</div>
              <div className="text-gray-300">Teacher Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gray-800 rounded-3xl p-12 text-center border border-gray-700"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Assessment Process?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
              Join thousands of educators who are already creating effective exams with NoHLAG Exams.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-3 rounded-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
              >
                Get Started
              </motion.button>
            </form>
            {isSubscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-green-400"
              >
                Thank you for subscribing! Check your email for further instructions.
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} NoHLAG Exams. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}