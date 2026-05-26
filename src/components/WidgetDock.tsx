import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, CloudSun, Music, ListTodo, Star, Settings, Minimize2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import type { WidgetType } from "../types";

interface WidgetDockProps {
  activeWidget: string | null;
  onToggleWidget: (widget: WidgetType) => void;
  onToggleMini: () => void;
  onOpenSettings: () => void;
}

const DOCK_ITEMS: { id: WidgetType; icon: typeof Clock; label: string }[] = [
  { id: "clock", icon: Clock, label: "Reloj" },
  { id: "weather", icon: CloudSun, label: "Clima" },
  { id: "music", icon: Music, label: "Música" },
  { id: "todos", icon: ListTodo, label: "Tareas" },
  { id: "favorites", icon: Star, label: "Favoritos" },
];

export function WidgetDock({
  activeWidget,
  onToggleWidget,
  onToggleMini,
  onOpenSettings,
}: WidgetDockProps) {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    hideTimer.current = setTimeout(() => {
      if (!activeWidget) setVisible(false);
    }, 4000);
  }, [activeWidget]);

  // Keep visible when a widget is active
  useEffect(() => {
    if (activeWidget) {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    }
  }, [activeWidget]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth - e.clientX < 80) {
        resetHideTimer();
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [resetHideTimer]);

  return (
    <div
      onMouseEnter={resetHideTimer}
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-500",
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-purple-500/15 bg-black/80 backdrop-blur-xl p-2 shadow-2xl shadow-purple-500/10">
        {DOCK_ITEMS.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="icon"
            size="icon"
            onClick={() => onToggleWidget(id)}
            title={label}
            className={cn(
              "transition-all duration-200",
              activeWidget === id && "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30"
            )}
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}

        <div className="w-6 h-px bg-purple-500/20 my-1" />

        <Button variant="icon" size="icon" onClick={onToggleMini} title="Modo Mini">
          <Minimize2 className="h-5 w-5" />
        </Button>

        <Button variant="icon" size="icon" onClick={onOpenSettings} title="Configuración">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
