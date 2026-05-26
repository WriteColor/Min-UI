import { useEffect, useRef, useState } from "react";
import { X, CloudSun, Droplets, Wind, Thermometer } from "lucide-react";
import type { WeatherData } from "../../types";

interface WeatherWidgetProps {
  data: WeatherData | null;
  onClose: () => void;
}

export function WeatherWidget({ data, onClose }: WeatherWidgetProps) {
  const [autoHide, setAutoHide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoHide) {
      timerRef.current = setTimeout(onClose, 10000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHide, onClose]);

  if (!data) {
    return (
      <WidgetShell onClose={onClose}>
        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
          <CloudSun className="h-5 w-5 mr-2 opacity-50" />
          Sin datos de clima disponibles
        </div>
      </WidgetShell>
    );
  }

  return (
    <WidgetShell
      onClose={onClose}
      onMouseEnter={() => {
        setAutoHide(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => setAutoHide(true)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-4xl font-light text-white">
            {data.temp !== null ? `${Math.round(data.temp)}°` : "--°"}
          </div>
          <div className="text-sm text-gray-400 mt-0.5">
            Sensación {data.feel !== null ? `${Math.round(data.feel)}°` : "--°"}
          </div>
          <div className="text-sm text-purple-300 mt-1">
            {data.emoji} {data.desc}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 font-mono">{data.local_time}</div>
          <div className="text-sm text-gray-300 mt-1">{data.place}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatPill icon={Droplets} label="Humedad" value={data.humidity !== null ? `${data.humidity}%` : "--"} />
        <StatPill icon={Wind} label="Viento" value={data.wind !== null ? `${data.wind} km/h` : "--"} />
        <StatPill icon={Thermometer} label="Precip." value={data.precip !== null ? `${data.precip} mm` : "--"} />
      </div>

      {data.forecast && data.forecast.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {data.forecast.slice(0, 5).map((day: { date?: string; emoji?: string; min: number | null; max: number | null }, i: number) => (
            <div key={i} className="flex flex-col items-center min-w-[4rem] rounded-lg bg-white/5 py-2 px-1.5 text-xs">
              <span className="text-gray-500">{day.date?.slice(5) || "--"}</span>
              <span className="text-lg my-0.5">{day.emoji}</span>
              <span className="text-gray-300">
                {day.min !== null ? Math.round(day.min) : "--"}° / {day.max !== null ? Math.round(day.max) : "--"}°
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

function WidgetShell({
  children,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-purple-500/15 bg-[rgba(8,4,15,0.95)] backdrop-blur-xl p-5 shadow-2xl shadow-purple-500/10 w-80 relative"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-white transition-colors cursor-pointer">
        <X className="h-3.5 w-3.5" />
      </button>
      {children}
    </div>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-white/5 py-2">
      <Icon className="h-3.5 w-3.5 text-purple-400" />
      <span className="text-[0.65rem] text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-xs text-gray-200 font-medium">{value}</span>
    </div>
  );
}
