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
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 select-none max-md:top-6 max-md:right-4 max-md:translate-y-0">
      <div className="hud-panel flex flex-col items-center gap-3 py-5 px-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] relative">
        {/* Micro-dashed rotating element behind the dock */}
        <div className="absolute inset-x-1.5 top-2 bottom-2 rounded-lg border border-dashed border-slate-200/70 pointer-events-none" />

        {/* Dynamic Widget Toggles */}
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeWidget === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onToggleWidget(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                title={item.label}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer relative group ${
                  isActive
                    ? "bg-teal-600 text-white shadow-[0_0_0_3px_rgba(13,148,136,0.18)] border border-teal-500 font-semibold"
                    : isHovered
                      ? "bg-teal-50 border border-teal-300 text-teal-700 scale-[1.03]"
                      : "bg-white/70 border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-700"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                
                {/* Micro pointer lines */}
                {isActive && (
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-1 w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Hover label */}
              {isHovered && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 rounded border border-slate-200/80 bg-white/90 text-[0.58rem] text-slate-600 font-mono tracking-widest whitespace-nowrap shadow-lg animate-fade-in">
                  {item.label.toUpperCase()}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider line */}
        <div className="w-6 h-[1px] bg-slate-200/80 my-1" />

        {/* Settings button */}
        <div className="relative">
          <button
            onClick={onOpenSettings}
            onMouseEnter={() => setHoveredItem("settings")}
            onMouseLeave={() => setHoveredItem(null)}
            title="Ajustes de MIN"
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer group ${
              hoveredItem === "settings"
                ? "bg-teal-50 border border-teal-300 text-teal-700 scale-[1.03]"
                : "bg-white/70 border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-700"
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          {hoveredItem === "settings" && (
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 rounded border border-slate-200/80 bg-white/90 text-[0.58rem] text-slate-600 font-mono tracking-widest whitespace-nowrap shadow-lg animate-fade-in">
              AJUSTES
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
