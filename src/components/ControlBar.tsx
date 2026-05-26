import { useState, useEffect, useCallback, useRef } from "react";
import { Send, VolumeX, Volume2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface ControlBarProps {
  onSendCommand: (text: string) => void;
  onToggleMute: () => void;
  isMuted: boolean;
  connected: boolean;
}

export function ControlBar({
  onSendCommand,
  onToggleMute,
  isMuted,
  connected,
}: ControlBarProps) {
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    hideTimer.current = setTimeout(() => setVisible(false), 5000);
  }, []);

  // Show on mouse enter bottom area
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerHeight - e.clientY < 80) {
        resetHideTimer();
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [resetHideTimer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !connected) return;
    onSendCommand(trimmed);
    setText("");
    resetHideTimer();
  };

  return (
    <div
      ref={barRef}
      onMouseEnter={resetHideTimer}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="mx-auto max-w-2xl px-4 pb-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-2xl border border-purple-500/20 bg-black/90 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-purple-500/10"
        >
          <Button
            type="button"
            variant="icon"
            size="icon"
            onClick={onToggleMute}
            title={isMuted ? "Activar micrófono" : "Silenciar"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-red-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-purple-400" />
            )}
          </Button>

          <Input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              resetHideTimer();
            }}
            placeholder={connected ? "Escribe un comando..." : "Desconectado"}
            disabled={!connected}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-gray-600"
          />

          <Button
            type="submit"
            variant="icon"
            size="icon"
            disabled={!text.trim() || !connected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
