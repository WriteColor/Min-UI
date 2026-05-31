"use client";

import { useState } from "react";
import {
  Clock,
  CloudSun,
  Music,
  ListTodo,
  Star,
  Settings,
} from "lucide-react";
import type { WidgetType } from "../types";

interface SidebarDockProps {
  activeWidget: string | null;
  onToggleWidget: (widget: WidgetType) => void;
  onOpenSettings: () => void;
}

const SIDEBAR_ITEMS: { id: WidgetType; icon: typeof Clock; label: string }[] = [
  { id: "clock", icon: Clock, label: "Reloj" },
  { id: "weather", icon: CloudSun, label: "Clima" },
  { id: "music", icon: Music, label: "Música" },
  { id: "todos", icon: ListTodo, label: "Tareas" },
  { id: "favorites", icon: Star, label: "Favoritos" },
];

export function SidebarDock({
  activeWidget,
  onToggleWidget,
  onOpenSettings,
}: SidebarDockProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="fixed right-4 top-1/2 z-40 -translate-y-1/2 max-md:right-3 max-md:top-4 max-md:translate-y-0">
      <div className="panel flex flex-col items-center gap-1 p-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeWidget === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onToggleWidget(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                aria-label={item.label}
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-all duration-150 ${
                  isActive
                    ? "bg-accent text-white"
                    : isHovered
                      ? "bg-surface-hover text-text-primary"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
              </button>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-surface-elevated px-2 py-1 text-xs font-medium text-text-primary shadow-lg animate-fade-in">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="my-1 h-px w-6 bg-border" />

        {/* Settings button */}
        <div className="relative">
          <button
            onClick={onOpenSettings}
            onMouseEnter={() => setHoveredItem("settings")}
            onMouseLeave={() => setHoveredItem(null)}
            aria-label="Ajustes"
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-all duration-150 ${
              hoveredItem === "settings"
                ? "bg-surface-hover text-text-primary"
                : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            }`}
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>

          {hoveredItem === "settings" && (
            <div className="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-surface-elevated px-2 py-1 text-xs font-medium text-text-primary shadow-lg animate-fade-in">
              Ajustes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
