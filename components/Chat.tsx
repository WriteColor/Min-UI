"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Mic, Paperclip, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  transcription?: boolean;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  transcription?: string;
  onSendMessage?: (message: string) => void;
  onFileUpload?: (file: File) => void;
}

export function Chat({
  isOpen,
  onClose,
  transcription = "",
  onSendMessage,
  onFileUpload,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (transcription && transcription.length > 0) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: transcription,
        timestamp: Date.now(),
        transcription: true,
      };
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === "user" && lastMsg.transcription) {
          return [...prev.slice(0, -1), { ...lastMsg, content: transcription }];
        }
        return [...prev, userMessage];
      });
    }
  }, [transcription]);

  const resetAutoHideTimer = useCallback(() => {
    if (autoHideTimer) clearTimeout(autoHideTimer);
    if (isOpen && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 8000);
      setAutoHideTimer(timer);
    }
  }, [autoHideTimer, isOpen, isExpanded]);

  useEffect(() => {
    resetAutoHideTimer();
    return () => {
      if (autoHideTimer) clearTimeout(autoHideTimer);
    };
  }, [isOpen, isExpanded, resetAutoHideTimer]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    onSendMessage?.(inputValue.trim());
    setInputValue("");
    resetAutoHideTimer();
  }, [inputValue, onSendMessage, resetAutoHideTimer]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload?.(file);
        const fileMessage: Message = {
          id: `file-${Date.now()}`,
          role: "user",
          content: `Archivo: ${file.name}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, fileMessage]);
      }
    },
    [onFileUpload]
  );

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
    resetAutoHideTimer();
  }, [resetAutoHideTimer]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-40 mx-auto w-full max-w-lg -translate-x-1/2 transition-all duration-300 ${
        isExpanded ? "h-[420px]" : "h-14"
      }`}
    >
      <div className="panel flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div
          className="flex cursor-pointer items-center justify-between border-b border-border px-4 py-3"
          onClick={handleToggleExpand}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-success" />
              <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-success/50" />
            </div>
            <span className="text-sm font-medium text-text-primary">
              MIN Assistant
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand();
              }}
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {isExpanded && (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-sm text-text-muted">
                  <Mic className="mb-2 h-8 w-8 opacity-50" />
                  <p>Habla o escribe un mensaje...</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-accent text-white"
                        : msg.role === "system"
                          ? "border border-warning/30 bg-warning/10 text-warning"
                          : "bg-surface-elevated text-text-primary"
                    } animate-fade-in`}
                  >
                    {msg.transcription && (
                      <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
                        <Mic className="h-3 w-3" />
                        <span>Transcripción</span>
                      </div>
                    )}
                    <span className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </span>
                    <div
                      className={`mt-1 text-[10px] opacity-50 ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className="input min-h-[42px] max-h-[120px] resize-none pr-10"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height =
                        Math.min(target.scrollHeight, 120) + "px";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2.5 right-2 rounded-md p-1 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="*/*"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="btn btn-primary h-[42px] w-[42px] p-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {[
                  "¿Qué puedes hacer?",
                  "Dime el clima",
                  "Reproducir música",
                  "Agregar tarea",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="shrink-0 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
