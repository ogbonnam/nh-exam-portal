"use client"; // Client Component needed for countdown & timer

import React, { useEffect, useState, useRef } from "react";

export default function ExamPage(props: any) {
  // resolved route id (string) — we accept props.params possibly being a Promise
  const [id, setId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState(true);

  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds
  const [examStarted, setExamStarted] = useState(false);
  const durationMinutes = 30; // TODO: replace with real duration from server

  const intervalRef = useRef<number | null>(null);

  // Resolve params.id (handles both synchronous object and Promise)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rawParams = await Promise.resolve(props?.params);
        // rawParams might be { id } or it might *be* the id directly in some cases
        const resolvedId =
          (rawParams && typeof rawParams === "object" && "id" in rawParams)
            ? rawParams.id
            : rawParams;
        if (!mounted) return;
        setId(resolvedId ? String(resolvedId) : null);
      } catch (err) {
        if (!mounted) return;
        setId(null);
      } finally {
        if (mounted) setLoadingId(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [props]);

  // Timer lifecycle
  useEffect(() => {
    // start timer when examStarted toggles on
    if (!examStarted) {
      // clear any previous interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // initialize timeLeft if not set
    if (timeLeft === null) {
      setTimeLeft(durationMinutes * 60);
    }

    // create interval
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev <= 1) {
          // time's up
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          window.alert("Time's up! Exam ended.");
          // TODO: trigger auto-submit here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // We intentionally don't include timeLeft in deps to let the interval manage decrement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examStarted]);

  // format seconds -> "MM:SS"
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loadingId) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading…</p>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-600">Missing or invalid exam id.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {!examStarted ? (
        <div>
          <p className="mb-4">Exam ID: <strong>{id}</strong></p>
          <button
            onClick={() => setExamStarted(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Start Exam
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Exam in Progress</h2>
          <p className="mb-4">Exam ID: <strong>{id}</strong></p>
          <p className="text-lg font-mono">Time Left: {formatTime(timeLeft)}</p>
          {/* TODO: Render questions here */}
        </div>
      )}
    </div>
  );
}
