"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string; // ISO 8601 string for the target date and time
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();

    // If the difference is 0 or negative, return 0 for all units
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, [targetDate]); // Recalculate if the targetDate changes

  // Pad single-digit numbers with a leading zero
  const pad = (num: number) => num.toString().padStart(2, "0");

  // Format the countdown string
  const countdownString = `${pad(timeLeft.days)}:${pad(timeLeft.hours)}:${pad(
    timeLeft.minutes
  )}:${pad(timeLeft.seconds)}`;

  return (
    <div className="flex items-center space-x-1">
      <span className="text-lg font-mono">{countdownString}</span>
    </div>
  );
}
