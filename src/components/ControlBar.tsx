import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Mic, MicOff, Keyboard } from "lucide-react";
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
  const [focused, setFocused] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    hideTimer.current = setTimeout(() => {
      if (!focused) setVisible(false);
    }, 4000);
  }, [focused]);

  // Show on mouse enter bottom area
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerHeight - e.clientY < 100) {
        resetHideTimer();
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [resetHideTimer]);

  // Keep visible when focused
  useEffect(() => {
    if (focused) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
    }
  }, [focused]);

  // Keyboard shortcut to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setVisible(true);
        inputRef.current?.focus();
      }
      // Escape to hide
      if (e.key === "Escape" && focused) {
        inputRef.current?.blur();
        setVisible(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused]);

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
      onMouseEnter={resetHideTimer}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      {/* Gradient fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      
      {/* Control bar container */}
      <div className="relative mx-auto max-w-xl px-4 pb-5">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex items-center gap-3 rounded-sm border bg-black/95 backdrop-blur-xl px-4 py-3 shadow-2xl transition-all duration-200",
            focused
              ? "border-purple-500/40 shadow-purple-500/20"
              : "border-purple-500/15 shadow-purple-500/5"
          )}
        >
          {/* Mute toggle */}
          <Button
            type="button"
            variant="icon"
            size="icon"
            onClick={onToggleMute}
            title={isMuted ? "Activar microfono" : "Silenciar"}
            className={cn(
              "shrink-0 transition-colors",
              isMuted 
                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                : "text-purple-400 hover:text-purple-300"
            )}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* Input field */}
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                resetHideTimer();
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={connected ? "Escribe un comando o pregunta..." : "Sin conexion al backend"}
              disabled={!connected}
              className={cn(
                "border-0 bg-transparent pr-8 text-white placeholder:text-gray-500 focus-visible:ring-0",
                !connected && "opacity-50"
              )}
            />
            {/* Keyboard shortcut hint */}
            {!focused && !text && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[0.65rem] text-gray-600">
                <Keyboard className="h-3 w-3" />
                <span>Ctrl+K</span>
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            type="submit"
            variant="icon"
            size="icon"
            disabled={!text.trim() || !connected}
            className={cn(
              "shrink-0",
              text.trim() && connected 
                ? "text-purple-400 hover:text-white hover:bg-purple-500/20" 
                : "text-gray-600"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Connection status indicator */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[0.6rem] text-gray-500">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              connected ? "bg-purple-500" : "bg-red-500"
            )}
          />
          <span>{connected ? "Conectado" : "Desconectado"}</span>
        </div>
      </div>
    </div>
  );
}
