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
      className="hud-panel p-5 w-72 max-md:w-[calc(100vw-2rem)] relative select-none animate-slide-up"
    >
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-300 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-teal-600 animate-pulse" />
        <span className="text-[0.62rem] text-slate-600 font-mono font-bold uppercase tracking-widest">
          SYS_CHRONO // OPERATIONAL
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 flex items-center justify-center shrink-0">
          <svg className="h-full w-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-slate-200 fill-none"
              strokeWidth="2.5"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-teal-500 fill-none transition-all duration-1000 ease-linear"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[0.68rem] text-slate-600 font-mono font-bold">
            {seconds.toString().padStart(2, "0")}s
          </span>
        </div>

        <div className="flex-grow">
          <div className="text-3xl font-light text-slate-900 font-mono tracking-widest leading-none">
            {time}
          </div>
          <div className="text-[0.68rem] text-slate-500 capitalize font-sans mt-1.5 font-medium tracking-wide">
            {date}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[0.6rem] font-mono text-slate-500">
        <div>UNIX_TS</div>
        <div className="text-slate-700 font-semibold tracking-wider">
          {unixTimestamp}
        </div>
      </div>
    </div>
  );
}
