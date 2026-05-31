"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Send,
  Mic,
  MicOff,
  Keyboard,
  Paperclip,
  X,
  MessageCircle,
} from "lucide-react";

interface ControlBarProps {
  onSendCommand: (text: string) => void;
  onToggleMute: () => void;
  isMuted: boolean;
  connected: boolean;
  audioLevel?: number;
  currentFile?: string;
  onClearFile?: () => void;
  onSelectFile?: (path: string) => void;
  onOpenChat?: () => void;
}

export function ControlBar({
  onSendCommand,
  onToggleMute,
  isMuted,
  connected,
  audioLevel = 0,
  currentFile = "",
  onClearFile = () => {},
  onSelectFile = () => {},
  onOpenChat = () => {},
}: ControlBarProps) {
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showPathInput, setShowPathInput] = useState(false);
  const [manualPath, setManualPath] = useState("");

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const barsRef = useRef<number[]>([4, 4, 4, 4]);
  const animationRef = useRef<number | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    hideTimer.current = setTimeout(() => {
      if (!focused && !text && !showPathInput) setVisible(false);
    }, 6000);
  }, [focused, text, showPathInput]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerHeight - e.clientY < 110) {
        resetHideTimer();
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [resetHideTimer]);

  useEffect(() => {
    if (focused || text || showPathInput) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
    }
  }, [focused, text, showPathInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setVisible(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && focused) {
        inputRef.current?.blur();
        setVisible(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused]);

  useEffect(() => {
    if (!connected || isMuted) {
      barsRef.current = [4, 4, 4, 4];
      return;
    }

    const animate = () => {
      barsRef.current = barsRef.current.map((_, idx) => {
        const base = 4 + audioLevel * 12;
        const variance = Math.random() * 6;
        return Math.max(4, Math.min(16, base + variance - idx * 1.5));
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [connected, isMuted, audioLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !connected) return;
    onSendCommand(trimmed);
    setText("");
    resetHideTimer();
  };

  const handleManualPathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualPath.trim()) {
      onSelectFile(manualPath.trim());
      setManualPath("");
      setShowPathInput(false);
    }
  };

  const filename = currentFile ? currentFile.split(/[/\\]/).pop() : "";

  return (
    <div
      onMouseEnter={resetHideTimer}
      className={`pointer-events-auto fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-3 px-4 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-8 opacity-0"
      }`}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2 rounded-full bg-surface/80 backdrop-blur px-3 py-1 shadow-sm">
        <div
          className={`h-1.5 w-1.5 rounded-full ${
            connected ? "bg-accent shadow-[0_0_6px_var(--accent)]" : "bg-danger"
          }`}
        />
        <span className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>

      {/* Main input container */}
      <div className="flex w-full max-w-xl flex-col gap-2">
        {/* File attachment banner */}
        {currentFile && (
          <div className="panel flex items-center justify-between px-3 py-2 text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <Paperclip className="h-3 w-3 text-accent" />
              <span className="truncate font-mono text-text-secondary">{filename}</span>
            </div>
            <button
              onClick={onClearFile}
              className="ml-2 rounded p-1 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Manual path input */}
        {showPathInput && (
          <form
            onSubmit={handleManualPathSubmit}
            className="panel flex items-center gap-2 p-2 animate-fade-in"
          >
            <input
              type="text"
              value={manualPath}
              onChange={(e) => setManualPath(e.target.value)}
              placeholder="Pegar ruta del archivo..."
              className="input flex-1 bg-surface-elevated text-xs"
            />
            <button type="submit" className="btn btn-primary px-3 py-1.5 text-xs">
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => setShowPathInput(false)}
              className="btn btn-ghost p-1.5"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Command bar */}
        <div
          className={`flex items-center gap-2 rounded-2xl border bg-surface/90 p-1.5 shadow-lg backdrop-blur-sm transition-all duration-150 ${
            focused ? "border-accent/40" : "border-border"
          }`}
        >
          {/* Mute button */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all ${
              isMuted
                ? "bg-danger/10 text-danger"
                : "bg-surface-elevated text-text-secondary hover:text-accent"
            }`}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => setShowPathInput(!showPathInput)}
            aria-label="Adjuntar archivo"
            className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all ${
              currentFile
                ? "bg-accent/10 text-accent"
                : "bg-surface-elevated text-text-secondary hover:text-accent"
            }`}
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                resetHideTimer();
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={
                connected ? "Escribe un comando..." : "Sin conexión"
              }
              disabled={!connected}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
            />

            {/* Keyboard hint */}
            {!focused && !text && (
              <div className="hidden items-center gap-1 rounded-md bg-surface-elevated px-2 py-1 text-[10px] text-text-muted sm:flex">
                <Keyboard className="h-3 w-3" />
                <span className="font-mono">Ctrl+K</span>
              </div>
            )}

            {/* Send button */}
            <button
              type="submit"
              disabled={!text.trim() || !connected}
              aria-label="Enviar"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-medium transition-all ${
                text.trim() && connected
                  ? "cursor-pointer bg-accent text-white shadow-[0_0_16px_rgba(168,85,247,0.4)] hover:shadow-[0_0_24px_rgba(168,85,247,0.6)] hover:brightness-110"
                  : "cursor-not-allowed bg-surface-elevated text-text-muted"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>

            {/* Chat button */}
            <button
              type="button"
              onClick={onOpenChat}
              aria-label="Abrir chat"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-surface-elevated text-text-secondary transition-all hover:text-accent"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </form>

          {/* Audio visualizer */}
          {connected && !isMuted && (
            <div className="flex items-center gap-0.5 border-l border-border/50 pl-2">
              {barsRef.current.map((height, idx) => (
                <div
                  key={idx}
                  className="w-[3px] rounded-full bg-gradient-to-t from-accent to-accent/60 shadow-[0_0_4px_rgba(168,85,247,0.5)]"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
