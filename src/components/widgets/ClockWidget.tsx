import { useState, useEffect, useRef } from "react";
import { X, Clock as ClockIcon } from "lucide-react";

interface ClockWidgetProps {
  onClose: () => void;
}

export function ClockWidget({ onClose }: ClockWidgetProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [autoHide, setAutoHide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-HN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("es-HN", {
          weekday: "long",
          day: "numeric",
          month: "long",
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
      timerRef.current = setTimeout(onClose, 10000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHide, onClose]);

  return (
    <div
      onMouseEnter={() => {
        setAutoHide(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => setAutoHide(true)}
      className="animate-slide-up rounded-sm border border-purple-500/15 bg-black/95 backdrop-blur-xl p-4 shadow-2xl shadow-purple-500/10 w-64 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-2.5 right-2.5 h-5 w-5 flex items-center justify-center rounded-sm text-gray-600 hover:text-white hover:bg-purple-500/15 transition-all cursor-pointer"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-center gap-1.5 mb-3">
        <ClockIcon className="h-3.5 w-3.5 text-purple-400" />
        <span className="text-[0.65rem] text-purple-400 font-medium uppercase tracking-wider">
          Hora Local
        </span>
      </div>

      <div className="text-3xl font-light text-white font-mono tracking-wider">
        {time}
      </div>
      <div className="text-xs text-gray-500 mt-1.5 capitalize">{date}</div>
    </div>
  );
}
