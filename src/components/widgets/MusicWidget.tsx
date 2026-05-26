import { useEffect, useRef, useState } from "react";
import { X, Play, Pause, SkipForward, SkipBack, Music } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import type { MediaInfo } from "../../types";

interface MusicWidgetProps {
  mediaInfo: MediaInfo | null;
  onMediaControl: (action: string) => void;
  onClose: () => void;
}

export function MusicWidget({ mediaInfo, onMediaControl, onClose }: MusicWidgetProps) {
  const [autoHide, setAutoHide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoHide && !mediaInfo?.title) {
      timerRef.current = setTimeout(onClose, 8000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHide, onClose, mediaInfo]);

  const isPlaying = mediaInfo?.status === "playing";
  const hasMedia = mediaInfo && mediaInfo.title && mediaInfo.title !== "Sin reproducción";

  return (
    <div
      onMouseEnter={() => {
        setAutoHide(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => setAutoHide(true)}
      className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-purple-500/15 bg-[rgba(8,4,15,0.95)] backdrop-blur-xl p-5 shadow-2xl shadow-purple-500/10 w-80 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-600 hover:text-white transition-colors cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {!hasMedia ? (
        <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
          <Music className="h-5 w-5 mr-2 opacity-50" />
          Sin reproducción activa
        </div>
      ) : (
        <>
          {/* Track Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Music className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-xs text-purple-400 font-medium uppercase tracking-wider">
                {mediaInfo?.app || "Media"}
              </span>
            </div>
            <h3 className="text-white font-medium text-sm truncate">
              {mediaInfo?.title}
            </h3>
            {mediaInfo?.artist && (
              <p className="text-gray-500 text-xs truncate mt-0.5">
                {mediaInfo.artist}
              </p>
            )}
          </div>

          {/* Progress Bar (visual placeholder) */}
          <div className="w-full h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
            <div
              className={cn(
                "h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000",
                isPlaying ? "w-2/3" : "w-1/3"
              )}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="icon"
              size="icon"
              onClick={() => onMediaControl("previous")}
              title="Anterior"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon-lg"
              onClick={() => onMediaControl(isPlaying ? "pause" : "play")}
              className="rounded-full"
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="icon"
              size="icon"
              onClick={() => onMediaControl("next")}
              title="Siguiente"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
