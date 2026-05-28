import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, CheckSquare, ListTodo } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { TodoItem } from "../../types";

interface TodoWidgetProps {
  todos: TodoItem[];
  onAddTodo: (title: string, priority: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onClose: () => void;
}

export function TodoWidget({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onClose }: TodoWidgetProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [autoHide, setAutoHide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoHide && todos.length === 0) {
      timerRef.current = setTimeout(onClose, 10000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHide, onClose, todos.length]);

  const handleAdd = () => {
    const t = title.trim();
    if (!t) return;
    onAddTodo(t, priority);
    setTitle("");
  };

  const pending = todos.filter((t) => t.status === "pending");
  const completed = todos.filter((t) => t.status === "completed");

  return (
    <div
      onMouseEnter={() => {
        setAutoHide(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => setAutoHide(true)}
      className="animate-slide-up rounded-sm border border-purple-500/15 bg-black/95 backdrop-blur-xl p-4 shadow-2xl shadow-purple-500/10 w-72 relative max-h-[70vh] flex flex-col"
    >
      <button onClick={onClose} className="absolute top-2.5 right-2.5 h-5 w-5 flex items-center justify-center rounded-sm text-gray-600 hover:text-white hover:bg-purple-500/15 transition-all cursor-pointer">
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-center gap-1.5 mb-3">
        <ListTodo className="h-3.5 w-3.5 text-purple-400" />
        <span className="text-[0.65rem] text-purple-400 font-medium uppercase tracking-wider">Tareas</span>
        <span className="text-[0.65rem] text-gray-600 ml-auto">{pending.length} pendientes</span>
      </div>

      {/* Add new */}
      <div className="flex gap-1.5 mb-3">
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleAdd()}
          placeholder="Nueva tarea..."
          className="flex-1 h-8 text-xs"
        />
        <Select value={priority} onValueChange={(v: string) => setPriority(v)}>
          <SelectTrigger className="w-20 h-8 text-[0.65rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">🔴 Alta</SelectItem>
            <SelectItem value="medium">🟡 Media</SelectItem>
            <SelectItem value="low">🟢 Baja</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="default" size="sm" onClick={handleAdd} className="h-8 w-8 p-0">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {pending.length === 0 && completed.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-6">Sin tareas</div>
        )}
        {pending.map((todo) => (
          <TodoRow key={todo.id} todo={todo} onToggle={onToggleTodo} onDelete={onDeleteTodo} />
        ))}
        {completed.length > 0 && (
          <>
            <div className="text-[0.6rem] text-gray-600 uppercase tracking-wider pt-2 pb-1">Completadas</div>
            {completed.slice(0, 5).map((todo) => (
              <TodoRow key={todo.id} todo={todo} onToggle={onToggleTodo} onDelete={onDeleteTodo} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TodoRow({ todo, onToggle, onDelete }: { todo: TodoItem; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const done = todo.status === "completed";
  const priorityDot = todo.priority === "high" ? "bg-red-500" : todo.priority === "medium" ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="flex items-center gap-2 rounded-sm bg-black/40 border border-purple-500/10 hover:border-purple-500/20 px-2.5 py-1.5 group transition-colors">
      <button onClick={() => onToggle(todo.id)} className="cursor-pointer">
        <CheckSquare className={`h-3.5 w-3.5 ${done ? "text-purple-400" : "text-gray-600"}`} />
      </button>
      <div className={`h-1.5 w-1.5 rounded-full ${priorityDot}`} />
      <span className={`flex-1 text-xs truncate ${done ? "text-gray-600 line-through" : "text-gray-300"}`}>{todo.title}</span>
      <button onClick={() => onDelete(todo.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all cursor-pointer">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
