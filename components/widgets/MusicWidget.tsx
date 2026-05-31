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
  const isPlaying =
    mediaInfo?.status === "playing" || (!mediaInfo?.status && mediaInfo?.title);

  return (
    <div className="panel w-72 space-y-4 p-5 animate-slide-up max-md:w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-text-secondary">
            {mediaInfo?.app || "Música"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Track info */}
      {mediaInfo?.title ? (
        <div className="space-y-1 text-left">
          <div className="truncate text-sm font-medium text-text-primary">
            {mediaInfo.title}
          </div>
          <div className="truncate text-xs text-text-muted">
            {mediaInfo.artist || "Artista desconocido"}
          </div>
        </div>
      ) : (
        <div className="py-2 text-center">
          <p className="text-sm text-text-muted">Sin reproducción activa</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 border-y border-border py-3">
        <button
          onClick={() => onMediaControl("prev")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface-elevated text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={() => onMediaControl("play_pause")}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-accent text-white transition-colors hover:bg-accent-hover"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        <button
          onClick={() => onMediaControl("next")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface-elevated text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      {/* Audio visualizer */}
      <div className="flex h-6 items-center justify-center gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((bar) => (
          <div
            key={bar}
            className="w-1 rounded-full bg-accent transition-all duration-300"
            style={{
              height: isPlaying ? `${4 + Math.random() * 16}px` : "4px",
              opacity: isPlaying ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
