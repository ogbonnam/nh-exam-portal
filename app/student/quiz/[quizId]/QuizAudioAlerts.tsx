// app/student/quiz/[id]/QuizAudioAlerts.tsx
"use client";

import { useEffect, useRef, useState } from 'react';

interface QuizAudioAlertsProps {
  endTime: Date;
  onTimeWarning?: () => void;
  onFocusLoss?: () => void;
}

export default function QuizAudioAlerts({ endTime, onTimeWarning, onFocusLoss }: QuizAudioAlertsProps) {
  const [timeWarningTriggered, setTimeWarningTriggered] = useState(false);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const timeWarningAudioRef = useRef<HTMLAudioElement>(null);
  const focusLossAudioRef = useRef<HTMLAudioElement>(null);

  // Check for time warning (5 minutes before end)
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const timeLeft = endTime.getTime() - now.getTime();
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));
      
      // Trigger warning when 5 minutes or less remain, but only once
      if (minutesLeft <= 5 && !timeWarningTriggered) {
        setTimeWarningTriggered(true);
        if (timeWarningAudioRef.current) {
          timeWarningAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
        if (onTimeWarning) onTimeWarning();
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [endTime, timeWarningTriggered, onTimeWarning]);

  // Handle focus loss
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User has switched tabs or minimized the window
        setFocusLossCount(prev => prev + 1);
        if (focusLossAudioRef.current) {
          focusLossAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
        if (onFocusLoss) onFocusLoss();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onFocusLoss]);

  return (
    <>
      {/* Audio elements for voice prompts */}
      <audio ref={timeWarningAudioRef}>
        <source src="/alerts/time-warning.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <audio ref={focusLossAudioRef}>
        <source src="/alerts/focus-loss.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      {/* Visual indicator for focus loss count */}
      {focusLossCount > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50 animate-pulse">
          <p className="font-bold">Warning: You have left the exam page {focusLossCount} time(s)</p>
        </div>
      )}
    </>
  );
}