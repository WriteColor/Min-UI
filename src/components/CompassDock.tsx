import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Clock, 
  CloudSun, 
  Music, 
  ListTodo, 
  Star, 
  Settings, 
  Grip,
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import type { WidgetType } from "../types";

interface CompassDockProps {
  activeWidget: string | null;
  onToggleWidget: (widget: WidgetType) => void;
  onOpenSettings: () => void;
}

const DOCK_ITEMS: { id: WidgetType; icon: typeof Clock; label: string }[] = [
  { id: "clock", icon: Clock, label: "Reloj" },
  { id: "weather", icon: CloudSun, label: "Clima" },
  { id: "music", icon: Music, label: "Musica" },
  { id: "todos", icon: ListTodo, label: "Tareas" },
  { id: "favorites", icon: Star, label: "Favoritos" },
];

export function CompassDock({
  activeWidget,
  onToggleWidget,
  onOpenSettings,
}: CompassDockProps) {
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-expand when widget is active
  useEffect(() => {
    if (activeWidget) {
      setExpanded(true);
    }
  }, [activeWidget]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position]);

  // Handle drag move
  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.max(16, Math.min(newX, maxX)),
        y: Math.max(16, Math.min(newY, maxY)),
      });
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  // Calculate item positions in a circle
  const getItemPosition = (index: number, total: number) => {
    // Start from top (-90deg) and go clockwise
    const startAngle = -90;
    const angleStep = 360 / total;
    const angle = (startAngle + index * angleStep) * (Math.PI / 180);
    const radius = 56; // Distance from center
    
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{
        right: position.x,
        top: position.y,
      }}
    >
      {/* Main container */}
      <div
        className={cn(
          "relative transition-all duration-300 ease-out",
          expanded ? "w-40 h-40" : "w-12 h-12"
        )}
      >
        {/* Circular background when expanded */}
        {expanded && (
          <div className="absolute inset-0 rounded-full border border-purple-500/15 bg-black/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 animate-fade-in" />
        )}

        {/* Orbital items */}
        {expanded && DOCK_ITEMS.map((item, index) => {
          const pos = getItemPosition(index, DOCK_ITEMS.length);
          const isActive = activeWidget === item.id;
          const isHovered = hoveredItem === item.id;
          
          return (
            <div
              key={item.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in"
              style={{
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Button
                variant="icon"
                size="icon"
                onClick={() => onToggleWidget(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                title={item.label}
                className={cn(
                  "h-9 w-9 rounded-sm transition-all duration-200",
                  isActive && "bg-purple-500/25 text-purple-300 ring-1 ring-purple-500/40",
                  isHovered && !isActive && "scale-110 bg-purple-500/15",
                  !isActive && !isHovered && "bg-black/60 border border-purple-500/10"
                )}
              >
                <item.icon className="h-4 w-4" />
              </Button>

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/95 border border-purple-500/20 rounded-sm text-[0.65rem] text-gray-300 whitespace-nowrap animate-fade-in z-50">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}

        {/* Center button - Toggle/Collapse */}
        <button
          onMouseDown={handleDragStart}
          onClick={() => {
            if (!dragging) {
              if (expanded && activeWidget) {
                onToggleWidget(null);
              }
              setExpanded(!expanded);
            }
          }}
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm border transition-all duration-200 flex items-center justify-center cursor-grab active:cursor-grabbing",
            expanded
              ? "h-10 w-10 bg-black/90 border-purple-500/30 hover:border-purple-500/50"
              : "h-12 w-12 bg-black/95 border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20",
            dragging && "cursor-grabbing"
          )}
        >
          {expanded ? (
            activeWidget ? (
              <X className="h-4 w-4 text-purple-400" />
            ) : (
              <Grip className="h-4 w-4 text-purple-400" />
            )
          ) : (
            <div className="relative">
              <div className="h-6 w-6 rounded-sm bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Grip className="h-3 w-3 text-white" />
              </div>
              {/* Pulse indicator */}
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            </div>
          )}
        </button>

        {/* Settings button (appears at bottom when expanded) */}
        {expanded && (
          <Button
            variant="icon"
            size="icon-sm"
            onClick={onOpenSettings}
            title="Configuracion"
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -bottom-10 h-7 w-7 rounded-sm bg-black/80 border border-purple-500/15 hover:border-purple-500/30 animate-fade-in",
            )}
            style={{ animationDelay: "250ms" }}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
