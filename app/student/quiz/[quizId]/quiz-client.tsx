"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuestionType } from "@prisma/client";
import { Clock, AlertCircle, CheckCircle, Save, List, ChevronRight, ChevronLeft, FileText, Timer } from "lucide-react";

type AnswersState = {
  [questionId: string]: string | string[];
};

export default function QuizClient(props: any) {
  const {
    quiz,
    attempt,
    existingAnswers = [],
    questions: propQuestions,
    startTimeISO,
    endTimeISO,
    serverNowISO,
  } = props;

  const router = useRouter();
  const attemptId = attempt.id;
  const LS_KEY = `quiz_progress_${attemptId}`;

  // Normalize questions
  const questions: any[] = (propQuestions && Array.isArray(propQuestions) ? propQuestions : quiz?.questions ?? []).map(
    (q: any) => ({
      id: q.id,
      text: q.text ?? q.questionText ?? q.question ?? "",
      imageUrl: q.imageUrl ?? q.image ?? null,
      type: q.type,
      points: q.points ?? 1,
      options: q.options ?? [],
    })
  );

  // Answers + index with localStorage restore
  const [answers, setAnswers] = useState<AnswersState>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.answers) return parsed.answers;
        }
      }
    } catch {}
    const init: AnswersState = {};
    (existingAnswers || []).forEach((ans: any) => {
      if (Array.isArray(ans.optionIds) && ans.optionIds.length > 0) {
        init[ans.questionId] = ans.optionIds.length === 1 ? ans.optionIds[0] : ans.optionIds;
      } else if (ans.textAnswer) {
        init[ans.questionId] = ans.textAnswer;
      }
    });
    return init;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.currentIndex === "number") return parsed.currentIndex;
        }
      }
    } catch {}
    return 0;
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(attempt.isSubmitted ?? false);
  const [saveStatus, setSaveStatus] = useState<string>("Loaded");
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [showQuestionPanel, setShowQuestionPanel] = useState<boolean>(false);

  // server offset (client - server)
  const [serverOffsetMs] = useState<number>(() => {
    try {
      if (!serverNowISO) return 0;
      const server = new Date(serverNowISO).getTime();
      const client = Date.now();
      return client - server;
    } catch {
      return 0;
    }
  });

  // compute ms left (server-authoritative)
  const computeMsLeft = useCallback(() => {
    try {
      if (!endTimeISO) return (quiz.duration ?? 60) * 60 * 1000;
      const endMs = new Date(endTimeISO).getTime();
      const clientNowAsServer = Date.now() - serverOffsetMs;
      return Math.max(0, endMs - clientNowAsServer);
    } catch {
      return 0;
    }
  }, [endTimeISO, quiz.duration, serverOffsetMs]);

  // seconds left (use CEIL to avoid flicker)
  const [timeLeft, setTimeLeft] = useState<number>(() => Math.max(0, Math.ceil(computeMsLeft() / 1000)));

  // autosave lock & attempt locks
  const saveLock = useRef(false);
  const autoSubmitLock = useRef(false);

  // audio & alert configuration
  const ALERT_THRESHOLD_SEC = 60; // warn at 60s left
  const FINAL_BEEP_AT_SEC = 5; // final beep in last 5s
  const warningPlayedRef = useRef(false);
  const finalBeepPlayedRef = useRef(false);
  const audioUnlockedRef = useRef(false);

  // Create Audio object for alert if available
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // Path: public/sounds/alert.mp3 (place your short beep there)
        alertAudioRef.current = new Audio("/sounds/alert.mp3");
        alertAudioRef.current.preload = "auto";
      }
    } catch {
      alertAudioRef.current = null;
    }
  }, []);

  // Try to unlock audio on any user interaction (click, keydown, answer change)
  useEffect(() => {
    const unlock = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      const a = alertAudioRef.current;
      if (a) {
        a.play().then(() => {
          a.pause();
          a.currentTime = 0;
        }).catch(() => {
          // can't autoplay yet; will try later when user interacts again
        });
      }
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Persist to localStorage on answers/index change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ answers, currentIndex, updatedAt: Date.now() }));
    } catch {}
  }, [answers, currentIndex]);

  // Format helpers
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const playBeep = (frequency = 880, durationMs = 200, type: OscillatorType = "sine") => {
    // First try the audio file (if unlocked)
    const audio = alertAudioRef.current;
    if (audio && audioUnlockedRef.current) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // fallback to WebAudio if file blocked
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = type;
          o.frequency.value = frequency;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
          o.start();
          setTimeout(() => {
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.01);
            o.stop(ctx.currentTime + 0.02);
            try { ctx.close(); } catch {}
          }, durationMs);
        } catch {
          // ignore
        }
      });
      return;
    }

    // If no audio file or not unlocked, fallback to WebAudio beep if possible
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = frequency;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      setTimeout(() => {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.01);
        o.stop(ctx.currentTime + 0.02);
        try { ctx.close(); } catch {}
      }, durationMs);
    } catch {
      // ignore
    }
  };

  // Auto-save formatting
  const formatForServer = useCallback(() => {
    return Object.entries(answers).map(([questionId, value]) => {
      const question = questions.find((q) => q.id === questionId);
      if (!question) {
        return { questionId, optionIds: [], textAnswer: typeof value === "string" ? value : null };
      }
      if (question.type === QuestionType.OPTIONS || question.type === QuestionType.CHECKBOX) {
        const optionIds = Array.isArray(value) ? value : value ? [value] : [];
        return { questionId, optionIds, textAnswer: null };
      } else {
        return { questionId, optionIds: [], textAnswer: (value as string) ?? null };
      }
    });
  }, [answers, questions]);

  async function handleSave() {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaveStatus("Saving...");
    try {
      const payload = { attemptId, answers: formatForServer() };
      await fetch("/api/student/save-answers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaveStatus("Saved");
    } catch (err) {
      console.error("Save failed", err);
      setSaveStatus("Save failed");
    } finally {
      saveLock.current = false;
    }
  }

  // autosave every 15s
  useEffect(() => {
    if (isSubmitted) return;
    const s = setInterval(() => {
      handleSave();
    }, 15000);
    return () => clearInterval(s);
  }, [answers, isSubmitted]);

  // blur/focus tracking
  useEffect(() => {
    const handleBlur = () => {
      if (!isSubmitted) {
        setShowWarning(true);
        try {
          navigator.sendBeacon?.("/api/student/track-focus", JSON.stringify({ attemptId }));
        } catch {}
        fetch("/api/student/track-focus", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ attemptId }),
        }).catch(() => {});
      }
    };
    const handleFocus = () => setShowWarning(false);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [attemptId, isSubmitted]);

  // submit request (used by manual and auto)
  // submit request (used by manual and auto)
  async function doSubmitOnce() {
    try {
      // ensure latest answers are persisted via the normal save (still awaited)
      await handleSave();

      // Build the authoritative payload (same shape used by /api/student/save-answers)
      const payloadBody = { attemptId, answers: formatForServer() };

      // Primary: normal POST with answers
      const res = await fetch("/api/student/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payloadBody),
      });

      // Parse response safely
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.warn("submit returned non-ok", data);
        return { ok: false, data };
      }

      return { ok: true, data };
    } catch (e) {
      console.warn("doSubmitOnce error", e);
      return { ok: false, error: e };
    }
  }


  // robust auto-submit + redirect
const autoSubmitAndRedirect = useCallback(async () => {
  if (autoSubmitLock.current) return;
  autoSubmitLock.current = true;

  // 1) Try normal submit (await it)
  const r = await doSubmitOnce();
  if (r.ok) {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setIsSubmitted(true);
    console.log("Auto-submit success (normal fetch)", r.data);
    // small delay so server logs/DB update can complete
    setTimeout(() => router.push("/student/dashboard?submitted=true"), 300);
    return;
  }

  // 2) Try sendBeacon as a fallback (fire-and-forget). sendBeacon should include cookies for same-origin.
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const payload = new Blob([JSON.stringify({ attemptId })], { type: "application/json" });
      navigator.sendBeacon("/api/student/submit", payload);
      console.warn("Used sendBeacon fallback for submit");
      // wait briefly and then redirect (give server ~1s)
      setTimeout(() => {
        try { localStorage.removeItem(LS_KEY); } catch {}
        setIsSubmitted(true);
        router.push("/student/dashboard?submitted=true");
      }, 1000);
      return;
    }
  } catch (e) {
    console.warn("sendBeacon fallback failed", e);
  }

  // 3) As a last fallback, use fetch with keepalive and credentials and wait for a short timeout
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1500); // cancel after 1.5s but still attempt
    fetch("/api/student/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ attemptId }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => { /* ignore */ })
      .finally(() => {
        clearTimeout(timeout);
      });
    // still give server a small grace period
    setTimeout(() => {
      try { localStorage.removeItem(LS_KEY); } catch {}
      setIsSubmitted(true);
      router.push("/student/dashboard?submitted=true");
    }, 1200);
    return;
  } catch (e) {
    console.warn("fetch keepalive fallback error", e);
  }

  // 4) If all fallbacks fail, still clear and redirect (we tried)
  try { localStorage.removeItem(LS_KEY); } catch {}
  setIsSubmitted(true);
  router.push("/student/dashboard?submitted=true");
}, [attemptId, router]);

  // Timer effect (recalcs ms left every 500ms; uses CEIL to avoid flicker)
  useEffect(() => {
    if (isSubmitted) return;

    // server-side ended check: if serverNow already past end, auto-submit
    if (endTimeISO && serverNowISO) {
      const serverNow = new Date(serverNowISO).getTime();
      const endMs = new Date(endTimeISO).getTime();
      if (serverNow >= endMs) {
        autoSubmitAndRedirect();
        return;
      }
    }

    // initialize immediately
    const initMs = computeMsLeft();
    setTimeLeft(Math.max(0, Math.ceil(initMs / 1000)));

    // clear previous interval if any (defensive)
    let interval = window.setInterval(() => {
      const ms = computeMsLeft();
      const secs = Math.max(0, Math.ceil(ms / 1000));
      setTimeLeft(secs);

      // play warning once when threshold crossed
      if (!warningPlayedRef.current && secs <= ALERT_THRESHOLD_SEC && secs > FINAL_BEEP_AT_SEC) {
        warningPlayedRef.current = true;
        playBeep(880, 300, "sine");
      }

      // final beep once
      if (!finalBeepPlayedRef.current && secs <= FINAL_BEEP_AT_SEC && secs > 0) {
        finalBeepPlayedRef.current = true;
        playBeep(1200, 120, "square");
      }

      // expiry -> auto-submit + redirect
      if (ms <= 0) {
        clearInterval(interval);
        // final tone
        playBeep(600, 400, "sine");
        autoSubmitAndRedirect();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [computeMsLeft, endTimeISO, serverNowISO, isSubmitted, autoSubmitAndRedirect]);

  // Answer handlers
  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    // unlock audio on first user action (helps autoplay)
    if (!audioUnlockedRef.current) {
      audioUnlockedRef.current = true;
      const a = alertAudioRef.current;
      if (a) {
        a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
      }
    }
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxToggle = (questionId: string, optionId: string, checked: boolean) => {
    if (!audioUnlockedRef.current) {
      audioUnlockedRef.current = true;
      const a = alertAudioRef.current;
      if (a) {
        a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
      }
    }
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      let next: string[];
      if (checked) next = [...current, optionId];
      else next = current.filter((id) => id !== optionId);
      return { ...prev, [questionId]: next };
    });
  };

  // Validation (same as your working code)
  const validateCurrentAnswer = () => {
    const q = questions[currentIndex];
    if (!q) return false;
    const val = answers[q.id];
    if (q.type === QuestionType.OPTIONS) {
      return typeof val === "string" && val.trim().length > 0;
    }
    if (q.type === QuestionType.CHECKBOX) {
      return Array.isArray(val) && (val as string[]).length > 0;
    }
    if (q.type === QuestionType.FILL_IN_THE_BLANK || q.type === QuestionType.PARAGRAPH) {
      return typeof val === "string" && val.trim().length > 0;
    }
    return !!val;
  };

  // Navigation functions
  const goNext = async () => {
    const valid = validateCurrentAnswer();
    if (!valid) {
      alert("Please answer this question before moving to the next one.");
      return;
    }
    await handleSave();
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const goPrevious = async () => {
    await handleSave();
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const goToQuestion = async (index: number) => {
    await handleSave();
    setCurrentIndex(index);
  };

  // Manual submit
  const handleSubmit = async () => {
    if (isSubmitted) return;
    
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => {
      const val = answers[q.id];
      if (q.type === QuestionType.OPTIONS) {
        return !(typeof val === "string" && val.trim().length > 0);
      }
      if (q.type === QuestionType.CHECKBOX) {
        return !(Array.isArray(val) && (val as string[]).length > 0);
      }
      if (q.type === QuestionType.FILL_IN_THE_BLANK || q.type === QuestionType.PARAGRAPH) {
        return !(typeof val === "string" && val.trim().length > 0);
      }
      return !val;
    });
    
    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(`You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }
    
    const r = await doManualSubmit();
    if (r?.ok) {
      try { localStorage.removeItem(LS_KEY); } catch {}
      setIsSubmitted(true);
      router.push("/student/dashboard?submitted=true");
    } else {
      alert("Submit failed — please try again.");
    }
  };

  async function doManualSubmit() {
    setSaveStatus("Submitting...");
    const r = await doSubmitOnce();
    return r;
  }

  // When no questions
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No questions found</h2>
          <p className="text-gray-600 mb-6">If you believe this is wrong, contact your administrator.</p>
          <button 
            onClick={() => router.push("/student/dashboard")} 
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;
  const nextDisabled = !validateCurrentAnswer();
  
  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Start: <strong>{startTimeISO ? new Date(startTimeISO).toLocaleString() : "TBD"}</strong>{" "}
                • End: <strong>{endTimeISO ? new Date(endTimeISO).toLocaleString() : "TBD"}</strong>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Timer className="h-4 w-4" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Toggle question navigator"
              >
                <List className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress: {answeredCount} of {questions.length} questions answered</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      {showWarning && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-7xl mx-auto mt-4 w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Warning: Leaving the quiz page is tracked and may affect your score.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Question Panel */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-medium mr-3">
                    {currentIndex + 1}
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentIndex + 1} of {questions.length}
                  </h2>
                  {answers[question.id] && (
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {question.points} {question.points === 1 ? 'point' : 'points'}
                </span>
              </div>

              <div className="prose max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: question.text || "" }} />
              </div>

              {question.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={question.imageUrl} 
                    alt="Question" 
                    className="max-h-64 rounded-md border border-gray-200"
                  />
                </div>
              )}

              <div className="space-y-3">
                {question.type === QuestionType.OPTIONS && question.options.map((opt: any) => (
                  <label 
                    key={opt.id} 
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[question.id] === opt.id 
                        ? 'bg-indigo-50 border-indigo-300' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={opt.id}
                      checked={answers[question.id] === opt.id}
                      onChange={() => handleAnswerChange(question.id, opt.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3">{opt.text}</span>
                    {opt.imageUrl && <img src={opt.imageUrl} alt="Option" className="max-h-12 ml-2 rounded" />}
                  </label>
                ))}

                {question.type === QuestionType.CHECKBOX && question.options.map((opt: any) => {
                  const checked = Array.isArray(answers[question.id]) && (answers[question.id] as string[]).includes(opt.id);
                  return (
                    <label 
                      key={opt.id} 
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked 
                          ? 'bg-indigo-50 border-indigo-300' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleCheckboxToggle(question.id, opt.id, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <span className="ml-3">{opt.text}</span>
                      {opt.imageUrl && <img src={opt.imageUrl} alt="Option" className="max-h-12 ml-2 rounded" />}
                    </label>
                  );
                })}

                {question.type === QuestionType.FILL_IN_THE_BLANK && (
                  <input
                    type="text"
                    value={(answers[question.id] as string) || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Type your answer here..."
                  />
                )}

                {question.type === QuestionType.PARAGRAPH && (
                  <textarea
                    rows={5}
                    value={(answers[question.id] as string) || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Type your answer here..."
                  />
                )}
              </div>

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={goPrevious}
                  disabled={isFirst}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    isFirst 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${
                    saveStatus === "Saved" ? "text-green-600" : 
                    saveStatus === "Saving..." ? "text-yellow-600" : 
                    saveStatus.includes("failed") ? "text-red-600" : "text-gray-500"
                  }`}>
                    {saveStatus === "Saved" && <CheckCircle className="inline h-4 w-4 mr-1" />}
                    {saveStatus === "Saving..." && <div className="inline h-4 w-4 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-yellow-600"></div>}
                    {saveStatus.includes("failed") && <AlertCircle className="inline h-4 w-4 mr-1" />}
                    {saveStatus}
                  </span>
                  <button 
                    onClick={handleSave} 
                    className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                </div>

                {isLast ? (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    disabled={nextDisabled}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      nextDisabled 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          {showQuestionPanel && (
            <div className="lg:w-64">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-medium text-gray-900 mb-3">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = index === currentIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        className={`h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                          isCurrent
                            ? "bg-indigo-600 text-white"
                            : isAnswered
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-indigo-600 rounded mr-2"></div>
                    <span className="text-gray-600">Current</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-green-100 rounded mr-2"></div>
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gray-100 rounded mr-2"></div>
                    <span className="text-gray-600">Not Answered</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}