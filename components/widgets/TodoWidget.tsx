"use client";

import { useState } from "react";
import { X, Plus, Trash2, ListTodo } from "lucide-react";
import type { TodoItem } from "../../types";

interface TodoWidgetProps {
  todos: TodoItem[];
  onAddTodo: (title: string, priority: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onClose: () => void;
}

export function TodoWidget({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onClose,
}: TodoWidgetProps) {
  const [newTitle, setNewTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTodo(newTitle.trim(), priority);
    setNewTitle("");
  };

  const getPriorityTag = (p: string) => {
    switch (p) {
      case "high":
        return { label: "[SYS_CRIT]", color: "text-rose-600 border-rose-200 bg-rose-50" };
      case "medium":
        return { label: "[SYS_WARN]", color: "text-amber-600 border-amber-200 bg-amber-50" };
      default:
        return { label: "[SYS_INFO]", color: "text-slate-600 border-slate-200 bg-slate-50" };
    }
  };

  return (
    <div className="hud-panel p-5 w-80 max-md:w-[calc(100vw-2rem)] relative select-none animate-slide-up space-y-4">
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-300 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2">
        <ListTodo className="h-4 w-4 text-teal-600 animate-pulse" />
        <span className="text-[0.62rem] text-slate-600 font-mono font-bold uppercase tracking-widest">
          SYS_REGISTRY // TODOS
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Añadir directiva..."
          className="flex-grow h-8 bg-white border border-slate-200 rounded px-2.5 text-xs text-slate-700 outline-none focus:border-teal-400 transition-all font-mono select-text"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="h-8 border border-slate-200 bg-white rounded px-1.5 text-[0.68rem] text-slate-700 outline-none focus:border-teal-400 cursor-pointer font-mono"
        >
          <option value="high" className="bg-white text-rose-600 font-bold">CRIT</option>
          <option value="medium" className="bg-white text-amber-600 font-bold">WARN</option>
          <option value="low" className="bg-white text-slate-600 font-bold">INFO</option>
        </select>

        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="h-8 w-8 shrink-0 flex items-center justify-center border border-teal-600 rounded bg-teal-600 text-white hover:bg-teal-500 cursor-pointer hover:shadow-[0_0_12px_rgba(13,148,136,0.35)] disabled:opacity-30 disabled:pointer-events-none transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 select-text">
        {todos.map((todo) => {
          const tag = getPriorityTag(todo.priority);
          return (
            <div
              key={todo.id}
              className="flex items-center justify-between p-2 rounded border border-slate-200/80 bg-white/70 hover:border-teal-300 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 flex-grow truncate mr-2 text-left">
                <input
                  type="checkbox"
                  checked={todo.status === "completed"}
                  onChange={() => onToggleTodo(todo.id)}
                  className="h-3.5 w-3.5 rounded border-slate-300 bg-white text-teal-600 focus:ring-0 cursor-pointer accent-teal-500"
                />
                
                <span 
                  className={`text-xs font-mono truncate leading-none transition-all ${
                    todo.status === "completed"
                      ? "line-through text-slate-400 font-light"
                      : "text-slate-900 font-medium"
                  }`}
                >
                  {todo.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[0.55rem] font-mono font-bold px-1.5 py-0.5 rounded border ${tag.color}`}>
                  {tag.label}
                </span>

                <button
                  type="button"
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {todos.length === 0 && (
          <div className="text-center py-4 text-slate-400 text-[0.62rem] uppercase font-mono tracking-widest border border-dashed border-slate-200 rounded">
            Registro vacío // Sin directivas
          </div>
        )}
      </div>
    </div>
  );
}
