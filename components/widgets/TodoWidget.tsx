"use client";

import { useState } from "react";
import { X, Plus, Trash2, ListTodo, Check } from "lucide-react";
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

  const getPriorityStyles = (p: string) => {
    switch (p) {
      case "high":
        return "bg-danger/10 text-danger";
      case "medium":
        return "bg-warning/10 text-warning";
      default:
        return "bg-surface-elevated text-text-muted";
    }
  };

  return (
    <div className="panel w-80 space-y-4 p-5 animate-slide-up max-md:w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-text-secondary">Tareas</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Add form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nueva tarea..."
          className="input flex-1 text-sm"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="input w-auto px-2 text-xs"
        >
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="btn btn-primary h-[42px] w-[42px] p-0 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {/* Todo list */}
      <div className="max-h-[200px] space-y-2 overflow-y-auto">
        {todos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-6 text-center">
            <p className="text-sm text-text-muted">Sin tareas pendientes</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 rounded-lg bg-surface-elevated p-3"
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
                  todo.status === "completed"
                    ? "border-success bg-success text-white"
                    : "border-border hover:border-accent"
                }`}
              >
                {todo.status === "completed" && <Check className="h-3 w-3" />}
              </button>

              <span
                className={`flex-1 truncate text-sm ${
                  todo.status === "completed"
                    ? "text-text-muted line-through"
                    : "text-text-primary"
                }`}
              >
                {todo.title}
              </span>

              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getPriorityStyles(todo.priority)}`}
              >
                {todo.priority === "high"
                  ? "Alta"
                  : todo.priority === "medium"
                    ? "Media"
                    : "Baja"}
              </span>

              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="cursor-pointer p-1 text-text-muted transition-colors hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
