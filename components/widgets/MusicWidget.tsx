"use client";

import { X, Play, Pause, SkipForward, SkipBack, Music } from "lucide-react";
import type { MediaInfo } from "../../types";

interface MusicWidgetProps {
  mediaInfo: MediaInfo | null;
  onMediaControl: (action: string) => void;
  onClose: () => void;
}

export function MusicWidget({
  mediaInfo,
  onMediaControl,
  onClose,
}: MusicWidgetProps) {
  const isPlaying = mediaInfo?.status === "playing" || (!mediaInfo?.status && mediaInfo?.title);

  return (
    <div className="hud-panel p-5 w-76 max-md:w-[calc(100vw-2rem)] relative select-none animate-slide-up space-y-4">
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-300 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-teal-600 animate-pulse" />
        <span className="text-[0.62rem] text-slate-600 font-mono font-bold uppercase tracking-widest">
          MEDIA_DECK // {mediaInfo?.app?.toUpperCase() || "SYSTEM"}
        </span>
      </div>

      {mediaInfo?.title ? (
        <div className="space-y-1 overflow-hidden select-text text-left">
          <div className="relative w-full overflow-hidden whitespace-nowrap">
            <div className="inline-block text-sm font-semibold text-slate-900 font-mono tracking-wider animate-marquee">
              {mediaInfo.title}
            </div>
          </div>
          <div className="text-[0.65rem] text-slate-500 truncate font-mono uppercase tracking-wide">
            {mediaInfo.artist || "DESCONOCIDO"}
          </div>
        </div>
      ) : (
        <div className="space-y-1 py-1 text-left">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-widest animate-pulse">
            SISTEMA EN ESPERA // STANDBY
          </div>
          <div className="text-[0.55rem] text-slate-400/70 font-mono uppercase">
            NO_AUDIO_STREAM_FOUND
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 py-1.5 border-y border-slate-200/80">
        <button
          onClick={() => onMediaControl("prev")}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white/70 text-slate-600 hover:border-teal-300 hover:text-teal-700 cursor-pointer transition-all"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={() => onMediaControl("play_pause")}
          className="h-9 w-9 rounded-lg flex items-center justify-center border border-teal-600 bg-teal-600 text-white cursor-pointer transition-all shadow-[0_0_12px_rgba(13,148,136,0.35)] hover:bg-teal-500"
        >
          {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
        </button>

        <button
          onClick={() => onMediaControl("next")}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white/70 text-slate-600 hover:border-teal-300 hover:text-teal-700 cursor-pointer transition-all"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between px-6 h-6 select-none pointer-events-none">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((bar) => {
          return (
            <div
              key={bar}
              className={`w-1 rounded-full bg-teal-500/80 transition-all duration-300`}
              style={{
                height: isPlaying ? `${4 + Math.random() * 18}px` : "4px",
                animationName: isPlaying ? "equalizer-bounce" : "none",
                animationDuration: "0.7s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
                animationDelay: `${bar * 90}ms`,
              }}
            />
          );
        })}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-10%, 0, 0); }
        }
        @keyframes equalizer-bounce {
          0% { height: 4px; opacity: 0.3; }
          100% { height: 22px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
