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
          <div className="text-4xl font-light text-white font-mono">
            {data.temp !== null ? `${Math.round(data.temp)}` : "--"}
            <span className="text-lg text-purple-400">C</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Sensacion {data.feel !== null ? `${Math.round(data.feel)}` : "--"}C
          </div>
          <div className="text-sm text-purple-300 mt-2 font-medium">
            {data.desc}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[0.65rem] text-gray-600 font-mono">{data.local_time}</div>
          <div className="text-xs text-gray-400 mt-1">{data.place}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <StatPill icon={Droplets} label="Humedad" value={data.humidity !== null ? `${data.humidity}%` : "--"} />
        <StatPill icon={Wind} label="Viento" value={data.wind !== null ? `${data.wind} km/h` : "--"} />
        <StatPill icon={Thermometer} label="Precip." value={data.precip !== null ? `${data.precip} mm` : "--"} />
      </div>

      {data.forecast && data.forecast.length > 0 && (
        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1">
          {data.forecast.slice(0, 5).map((day: { date?: string; desc?: string; min: number | null; max: number | null }, i: number) => (
            <div key={i} className="flex flex-col items-center min-w-[3.5rem] rounded-sm bg-black/40 border border-purple-500/10 py-2 px-1 text-[0.6rem]">
              <span className="text-gray-600 font-mono">{day.date?.slice(5) || "--"}</span>
              <span className="text-gray-400 text-[0.55rem] truncate max-w-full mt-0.5">{day.desc?.slice(0, 8)}</span>
              <span className="text-gray-300 mt-1 font-mono">
                {day.min !== null ? Math.round(day.min) : "--"}/{day.max !== null ? Math.round(day.max) : "--"}
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
      className="animate-slide-up rounded-sm border border-purple-500/15 bg-black/95 backdrop-blur-xl p-4 shadow-2xl shadow-purple-500/10 w-72 relative"
    >
      <button 
        onClick={onClose} 
        className="absolute top-2.5 right-2.5 h-5 w-5 flex items-center justify-center rounded-sm text-gray-600 hover:text-white hover:bg-purple-500/15 transition-all cursor-pointer"
      >
        <X className="h-3 w-3" />
      </button>
      {children}
    </div>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-sm bg-black/40 border border-purple-500/10 py-2">
      <Icon className="h-3 w-3 text-purple-400" />
      <span className="text-[0.55rem] text-gray-600 uppercase tracking-wider">{label}</span>
      <span className="text-[0.65rem] text-gray-300 font-mono">{value}</span>
    </div>
  );
}
