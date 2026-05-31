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
      <div className="panel w-80 p-5 animate-slide-up max-md:w-[calc(100vw-2rem)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-text-secondary">
              Clima
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-text-muted">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const tempVal = data.temp ?? 0;
  const tempRatio = Math.max(0, Math.min(100, ((tempVal + 10) / 50) * 100));

  return (
    <div className="panel w-80 space-y-4 p-5 animate-slide-up max-md:w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-text-secondary">
            {data.place}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main temperature */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-4xl font-light text-text-primary">
            {data.temp !== null ? `${Math.round(data.temp)}°` : "--"}
          </div>
          <div className="mt-1 text-sm capitalize text-text-muted">
            {data.desc}
          </div>
        </div>
        <span className="text-5xl">{data.emoji || "☀️"}</span>
      </div>

      {/* Temperature bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-text-muted">
          <span>Temperatura</span>
          <span>
            {data.feel !== null ? `Sensación: ${Math.round(data.feel)}°` : ""}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-accent transition-all duration-1000"
            style={{ width: `${tempRatio}%` }}
          />
        </div>
      </div>

      {/* Wind and humidity */}
      <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-text-muted" />
          <div>
            <div className="text-xs text-text-muted">Viento</div>
            <div className="text-sm font-medium text-text-primary">
              {data.wind !== null ? `${data.wind} km/h` : "--"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-text-muted" />
          <div>
            <div className="text-xs text-text-muted">Humedad</div>
            <div className="text-sm font-medium text-text-primary">
              {data.humidity !== null ? `${data.humidity}%` : "--"}
            </div>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {data.forecast && data.forecast.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <div className="text-xs text-text-muted">Pronóstico</div>
          <div className="grid grid-cols-3 gap-2">
            {data.forecast.slice(0, 3).map((f, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-surface-elevated p-2 text-center"
              >
                <div className="text-xs text-text-muted">
                  {f.date.split("-")[2] || f.date}
                </div>
                <div className="my-1 text-xl">{f.emoji}</div>
                <div className="text-sm font-medium text-text-primary">
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
