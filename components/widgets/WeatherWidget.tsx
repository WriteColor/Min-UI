"use client";

import { X, CloudSun, Wind, Droplets } from "lucide-react";
import type { WeatherData } from "../../types";

interface WeatherWidgetProps {
  data: WeatherData | null;
  onClose: () => void;
}

export function WeatherWidget({ data, onClose }: WeatherWidgetProps) {
  if (!data) {
    return (
      <div className="hud-panel p-5 w-76 max-md:w-[calc(100vw-2rem)] relative select-none animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-300 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <CloudSun className="h-4 w-4 text-teal-600 animate-pulse" />
          <span className="text-[0.62rem] text-slate-600 font-mono font-bold uppercase tracking-widest">
            SYS_METEO // SYNCHRONIZING
          </span>
        </div>
        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider animate-pulse">
          Buscando coordenadas satelitales...
        </p>
      </div>
    );
  }

  const tempVal = data.temp ?? 0;
  const tempRatio = Math.max(0, Math.min(100, ((tempVal + 10) / 50) * 100));

  return (
    <div className="hud-panel p-5 w-80 max-md:w-[calc(100vw-2rem)] relative select-none animate-slide-up space-y-4">
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-300 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2">
        <CloudSun className="h-4 w-4 text-teal-600 animate-pulse" />
        <span className="text-[0.62rem] text-slate-600 font-mono font-bold uppercase tracking-widest">
          SYS_METEO // {data.place.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-4xl font-extralight text-slate-900 font-mono leading-none tracking-tight">
            {data.temp !== null ? `${Math.round(data.temp)}°C` : "--"}
          </div>
          <div className="text-[0.65rem] text-slate-500 uppercase font-mono mt-2 tracking-wide">
            {data.desc.toUpperCase()}
          </div>
        </div>
        <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(13,148,136,0.35)]">
          {data.emoji || "☀️"}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[0.55rem] text-slate-500 font-mono">
          <span>THERMO_LEVEL</span>
          <span>{data.feel !== null ? `SENSACIÓN: ${Math.round(data.feel)}°` : ""}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden border border-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-sky-400 transition-all duration-1000"
            style={{ width: `${tempRatio}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <Wind className="h-4 w-4 text-slate-500" />
          <div className="font-mono text-left">
            <div className="text-[0.55rem] text-slate-500 uppercase">VIENTO</div>
            <div className="text-[0.68rem] text-slate-800 font-semibold">{data.wind !== null ? `${data.wind} km/h` : "--"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Droplets className="h-4 w-4 text-slate-500" />
          <div className="font-mono text-left">
            <div className="text-[0.55rem] text-slate-500 uppercase">HUMEDAD</div>
            <div className="text-[0.68rem] text-slate-800 font-semibold">{data.humidity !== null ? `${data.humidity}%` : "--"}</div>
          </div>
        </div>
      </div>

      {data.forecast && data.forecast.length > 0 && (
        <div className="pt-3 border-t border-slate-200/80 space-y-2">
          <div className="text-[0.55rem] text-slate-500 uppercase font-mono tracking-wider">
            FORECAST // PROYECCIÓN
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.forecast.slice(0, 3).map((f, idx) => (
              <div 
                key={idx} 
                className="p-2 rounded bg-white/70 border border-slate-200 text-center font-mono space-y-1 hover:border-teal-300 transition-all duration-300"
              >
                <div className="text-[0.55rem] text-slate-500 uppercase truncate">
                  {f.date.split("-")[2] || f.date}
                </div>
                <div className="text-[0.8rem] filter drop-shadow-[0_0_4px_rgba(13,148,136,0.2)]">
                  {f.emoji}
                </div>
                <div className="text-[0.62rem] text-slate-800 font-bold">
                  {f.max !== null ? `${Math.round(f.max)}°` : "--"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
