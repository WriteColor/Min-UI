"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Mic, FileText, ChevronDown, ChevronUp } from "lucide-react";

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
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);
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
          content: `📎 ${file.name}`,
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
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-40
        w-full max-w-lg mx-auto
        transition-all duration-500 ease-out
        ${isExpanded ? "h-[420px]" : "h-16"}
      `}
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.1)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 cursor-pointer"
          onClick={handleToggleExpand}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400/50 animate-ping" />
            </div>
            <span className="text-sm font-medium text-slate-200 font-mono tracking-wide">
              MIN Assistant
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 transition-colors text-slate-400 hover:text-rose-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {isExpanded && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                  <Mic className="w-8 h-8 mb-2 opacity-50" />
                  <p>Speak or type a message to begin...</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                      max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md"
                          : msg.role === "system"
                          ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-bl-md"
                          : "bg-slate-700/60 text-slate-200 rounded-bl-md"
                      }
                      ${msg.transcription ? "font-medium" : ""}
                      transition-all duration-300 animate-fade-in
                    `}
                  >
                    {msg.transcription && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs opacity-70">
                        <Mic className="w-3 h-3" />
                        <span>Transcription</span>
                      </div>
                    )}
                    <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                    <div
                      className={`text-[0.65rem] mt-1.5 opacity-50 ${
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
            <div className="p-3 border-t border-slate-700/50">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message or speak..."
                    className="w-full px-4 py-2.5 pr-12 bg-slate-800/60 border border-slate-600/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    rows={1}
                    style={{
                      maxHeight: "120px",
                      minHeight: "42px",
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = Math.min(target.scrollHeight, 120) + "px";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 bottom-2.5 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
                  >
                    <FileText className="w-4 h-4" />
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
                  className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {[
                  "What can you help me with?",
                  "Tell me about the weather",
                  "Play some music",
                  "Add a todo item",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInputValue(suggestion);
                    }}
                    className="flex-shrink-0 px-3 py-1.5 text-xs rounded-full bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500/50 transition-all duration-200 whitespace-nowrap"
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
