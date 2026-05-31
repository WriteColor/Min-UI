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

  const level = Math.max(0, Math.min(1, audioLevel));
  const filename = currentFile ? currentFile.split(/[/\\]/).pop() : "";

  return (
    <div
      onMouseEnter={resetHideTimer}
      className={`pointer-events-auto fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 px-4 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-8 opacity-0"
      }`}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs text-text-muted">
        <div
          className={`h-1.5 w-1.5 rounded-full ${
            connected ? "bg-success" : "bg-danger"
          }`}
        />
        <span className="font-mono text-[10px] uppercase tracking-wider">
          {connected ? "Conectado" : "Sin conexión"}
        </span>
      </div>

      {/* Main input container */}
      <div className="flex w-full max-w-xl flex-col gap-2">
        {/* File attachment banner */}
        {currentFile && (
          <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-xs text-text-secondary animate-fade-in">
            <span className="truncate font-mono">{filename}</span>
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
            className="flex items-center gap-2 rounded-lg bg-surface p-2 animate-fade-in"
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
          className={`flex items-center gap-2 rounded-xl border bg-surface p-2 transition-all duration-150 ${
            focused ? "border-border-focus" : "border-border"
          }`}
        >
          {/* Mute button */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all ${
              isMuted
                ? "bg-danger/10 text-danger"
                : "bg-surface-elevated text-text-secondary hover:text-text-primary"
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
            className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all ${
              currentFile
                ? "bg-accent/10 text-accent"
                : "bg-surface-elevated text-text-secondary hover:text-text-primary"
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
              <div className="hidden items-center gap-1 text-[10px] text-text-muted sm:flex">
                <Keyboard className="h-3 w-3" />
                <span className="font-mono">Ctrl+K</span>
              </div>
            )}

            {/* Send button */}
            <button
              type="submit"
              disabled={!text.trim() || !connected}
              aria-label="Enviar"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                text.trim() && connected
                  ? "cursor-pointer bg-accent text-white hover:bg-accent-hover"
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
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-surface-elevated text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </form>

          {/* Audio level indicator */}
          {connected && !isMuted && (
            <div className="flex items-center gap-0.5 border-l border-border pl-2">
              {[0, 1, 2, 3].map((idx) => {
                const barHeight = 4 + level * 12 * (0.6 + Math.random() * 0.4);
                return (
                  <div
                    key={idx}
                    className="w-[3px] rounded-full bg-accent transition-all duration-100"
                    style={{
                      height: `${Math.max(4, Math.min(16, barHeight))}px`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
