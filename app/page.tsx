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
      color: "from-green-400 to-emerald-600",
    },
    {
      icon: <FaClock className="text-3xl" />,
      title: "Time Tracking",
      description:
        "Monitor your progress and improve your time management skills.",
      color: "from-blue-400 to-cyan-600",
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "Performance Analytics",
      description:
        "Track your growth with comprehensive statistics and insights.",
      color: "from-purple-400 to-indigo-600",
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Collaborative Learning",
      description:
        "Compete with friends and join study groups for better results.",
      color: "from-pink-400 to-rose-600",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-x-hidden">
      {/* Enhanced Navigation */}
  

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4 py-20">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {bubbles &&
            bubbles.map((b, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-purple-500/10"
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
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            <span className="text-sm font-medium">
              🚀 The Future of Education is Here
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
          >
            Administer Any Exam
            <br />
            <span className="text-white">Effortlessly</span>
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
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
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
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-all cursor-pointer"
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
      <section id="features" className="py-20 px-4">
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
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mb-6`}>
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
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-300">Educators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-gray-300">Question Types</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-gray-300">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">4.9</div>
              <div className="text-gray-300">Teacher Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Commented Out */}
      {/* <section id="testimonials" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied learners who have transformed their study habits with QuizMaster Pro.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-yellow-400 ${
                        i < testimonial.rating ? "" : "opacity-30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-300 italic">
                  <FaQuoteLeft className="inline mr-2 text-purple-400 opacity-50" />
                  {testimonial.content}
                  <FaQuoteRight className="inline ml-2 text-purple-400 opacity-50" />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Pricing Section - Commented Out */}
      {/* <section id="pricing" className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Select the perfect plan for your learning needs. All plans include our core features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`bg-white/10 backdrop-blur-md rounded-2xl p-8 border ${
                  plan.highlighted
                    ? "border-purple-500 shadow-lg shadow-purple-500/30"
                    : "border-white/20"
                } hover:bg-white/15 transition-all relative`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">/{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <FaCheckCircle className="text-green-400 mr-3 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-full font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/30"
                      : "bg-white/10 hover:bg-white/20 border border-white/20"
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Assessment Process?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of educators who are already creating effective exams with NoHLAG Exams.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-8 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
              >
                Get Started
              </motion.button>
            </form>
            {isSubscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-green-300"
              >
                Thank you for subscribing! Check your email for further instructions.
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="py-12 px-4 border-t border-white/10">
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