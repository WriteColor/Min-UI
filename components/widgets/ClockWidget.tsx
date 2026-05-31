"use client";

import { useState, useEffect, useRef } from "react";
import { X, Clock } from "lucide-react";

interface ClockWidgetProps {
  onClose: () => void;
}

export function ClockWidget({ onClose }: ClockWidgetProps) {
  const [time, setTime] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [date, setDate] = useState("");
  const [unixTimestamp, setUnixTimestamp] = useState(0);
  const [autoHide, setAutoHide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSeconds(now.getSeconds());
      setUnixTimestamp(Math.floor(now.getTime() / 1000));
      setTime(
        now.toLocaleTimeString("es-HN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("es-HN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoHide) {
      timerRef.current = setTimeout(onClose, 12000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHide, onClose]);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (seconds / 60) * circumference;

  return (
    <div
      onMouseEnter={() => {
        setAutoHide(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => setAutoHide(true)}
      className="panel w-72 p-5 animate-slide-up max-md:w-[calc(100vw-2rem)]"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-text-secondary">Reloj</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Time display */}
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="fill-none stroke-surface-elevated"
              strokeWidth="3"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="fill-none stroke-accent transition-all duration-1000 ease-linear"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute font-mono text-xs font-medium text-text-secondary">
            {seconds.toString().padStart(2, "0")}s
          </span>
        </div>

        <div className="flex-1">
          <div className="font-mono text-3xl font-light tracking-wider text-text-primary">
            {time}
          </div>
          <div className="mt-1 text-sm capitalize text-text-muted">{date}</div>
        </div>
      </div>

      {/* Unix timestamp */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-text-muted">UNIX</span>
        <span className="font-mono text-xs font-medium text-text-secondary">
          {unixTimestamp}
        </span>
      </div>
    </div>
  );
}
