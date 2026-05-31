"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Mic, MicOff, Keyboard, Paperclip, X, MessageCircle } from "lucide-react";

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

  // Show console when mouse is near bottom (hover reveal)
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

  // Keyboard shortcut listener (Ctrl+K and Escape)
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
      className={`fixed bottom-6 inset-x-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] px-6 max-md:px-4 pointer-events-auto flex flex-col items-center gap-3 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      {/* Cockpit Titlebar Telemetry */}
      <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-slate-200/80 bg-white/80 text-[0.65rem] text-slate-600 font-mono tracking-[0.25em] uppercase translate-y-1 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
        <div
          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
            connected ? "bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-rose-500"
          }`}
        />
        <span>CONSOLE // PORT_8765</span>
      </div>

      {/* Floating Chat container */}
      <div className="w-full max-w-xl flex flex-col gap-2">
        {/* Active attachment banner */}
        {currentFile && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/70 border border-slate-200/80 text-[0.7rem] text-slate-600 font-mono shadow-sm animate-fade-in">
            <span className="truncate">ADJUNTO: {currentFile}</span>
            <button
              onClick={onClearFile}
              className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Manual path input overlay */}
        {showPathInput && (
          <form
            onSubmit={handleManualPathSubmit}
            className="flex items-center gap-2 p-2 rounded-lg bg-white/90 border border-slate-200/80 shadow-xl animate-fade-in"
          >
            <input
              type="text"
              value={manualPath}
              onChange={(e) => setManualPath(e.target.value)}
              placeholder="Pegar ruta local del archivo..."
              className="flex-grow bg-transparent border-0 outline-none text-xs text-slate-700 placeholder-slate-400 font-mono select-text"
            />
            <button
              type="submit"
              className="px-2.5 h-6 rounded border border-teal-300 text-[0.58rem] font-mono text-teal-700 hover:bg-teal-600 hover:text-white transition-all cursor-pointer"
            >
              CONFIRMAR
            </button>
            <button
              type="button"
              onClick={() => setShowPathInput(false)}
              className="text-slate-400 hover:text-rose-500 p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Core console bar */}
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-white/80 backdrop-blur-xl px-4 py-2.5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-all duration-300 relative ${
            focused
              ? "border-teal-400/70 shadow-[0_0_0_4px_rgba(13,148,136,0.12)]"
              : "border-slate-200/80"
          }`}
        >
          {/* Brackets */}
          <div className="absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-slate-300/70" />
          <div className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-slate-300/70" />
          <div className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-slate-300/70" />
          <div className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-slate-300/70" />

          {/* Mute button */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isMuted
                ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                : "bg-slate-900/5 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Attachment upload */}
          <button
            type="button"
            onClick={() => setShowPathInput(!showPathInput)}
            className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center border transition-all duration-300 cursor-pointer ${
              currentFile
                ? "bg-teal-50 text-teal-700 border-teal-200"
                : "bg-white/70 border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-700"
            }`}
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <span className="font-mono text-slate-500/80 text-xs font-semibold select-none shrink-0 tracking-wider">
            MIN://&gt;
          </span>

          {/* Send text form */}
          <form onSubmit={handleSubmit} className="flex-grow flex items-center gap-3">
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
                connected
                  ? "Escribir orden del kernel..."
                  : "KERNEL_LINK_ERROR // NO_CONN"
              }
              disabled={!connected}
              className={`w-full bg-transparent border-0 outline-none text-slate-900 placeholder-slate-400/70 text-xs font-mono py-1 pr-14 select-text ${
                !connected ? "opacity-50" : ""
              }`}
            />

            {!focused && !text && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[0.58rem] text-slate-400 font-mono tracking-widest select-none pointer-events-none">
                <Keyboard className="h-3 w-3" />
                <span>CTRL+K</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!text.trim() || !connected}
              className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                text.trim() && connected
                  ? "bg-teal-600 border border-teal-600 text-white hover:bg-teal-500 cursor-pointer hover:shadow-[0_0_14px_rgba(13,148,136,0.35)]"
                  : "text-slate-300 border border-slate-200 cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>

            {/* Chat Assistant button */}
            <button
              type="button"
              onClick={onOpenChat}
              className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100 transition-all duration-300 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </form>

          {/* Sound reactive equalizers */}
          {connected && !isMuted && (
            <div className="flex items-center gap-0.5 px-1 select-none pointer-events-none border-l border-slate-200/80 h-5">
              {[0, 1, 2, 3].map((idx) => {
                const heightVal = 4 + level * 14 * (0.6 + Math.random() * 0.5);
                return (
                  <div
                    key={idx}
                    className="w-0.9 rounded-full bg-teal-500 transition-all duration-150"
                    style={{
                      height: `${Math.max(4, Math.min(18, heightVal))}px`,
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
