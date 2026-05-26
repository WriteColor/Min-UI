/**
 * App.tsx — MIN Asistente IA
 * Interfaz principal: Orb + ControlBar auto-hide + WidgetDock + Settings Dialog
 * Toda la lógica de WebSocket delegada al hook useWebSocket.
 */
import { useState, useCallback } from "react";
import Orb from "./components/Orb";
import { ControlBar } from "./components/ControlBar";
import { WidgetDock } from "./components/WidgetDock";
import { StatusDot } from "./components/StatusDot";
import { SettingsDialog } from "./components/SettingsDialog";

// Widgets
import { WeatherWidget } from "./components/widgets/WeatherWidget";
import { MusicWidget } from "./components/widgets/MusicWidget";
import { ClockWidget } from "./components/widgets/ClockWidget";
import { TodoWidget } from "./components/widgets/TodoWidget";
import { FavoritesWidget } from "./components/widgets/FavoritesWidget";

// Hook
import { useWebSocket } from "./hooks/useWebSocket";
import type { MinConfig, WidgetType } from "./types";

export default function App() {
  const ws = useWebSocket();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Widget rendering near the dock
  const handleToggleWidget = useCallback(
    (widget: WidgetType) => {
      ws.setActiveWidget(ws.activeWidget === widget ? null : widget);
    },
    [ws]
  );

  const closeWidget = useCallback(() => ws.setActiveWidget(null), [ws]);

  // Config change handler (merges into current config state)
  const handleConfigChange = useCallback(
    (key: string, value: unknown) => {
      ws.setConfig((prev: Partial<MinConfig>) => ({ ...prev, [key]: value }));
    },
    [ws]
  );

  const handleSaveConfig = useCallback(() => {
    ws.saveConfig(ws.config);
    setSettingsOpen(false);
  }, [ws]);

  const handleToggleMini = useCallback(() => {
    // For now, mini mode is a Tauri window resize — just toggle a class
    // Full mini mode will be implemented with Tauri window API
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* ── Orb Background (full viewport, no scroll) ─────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Orb state={ws.state} volume={ws.audioLevel} theme="purple" />
      </div>

      {/* ── Status Dot (top-left) ─────────────────────────────────────────── */}
      <div className="fixed top-4 left-4 z-50">
        <StatusDot connected={ws.connected} />
      </div>

      {/* ── Active Widget (renders next to dock) ──────────────────────────── */}
      <div className="fixed right-16 top-1/2 -translate-y-1/2 z-30">
        {ws.activeWidget === "weather" && (
          <WeatherWidget data={ws.weatherData} onClose={closeWidget} />
        )}
        {ws.activeWidget === "music" && (
          <MusicWidget
            mediaInfo={ws.mediaInfo}
            onMediaControl={ws.sendMediaControl}
            onClose={closeWidget}
          />
        )}
        {ws.activeWidget === "clock" && (
          <ClockWidget onClose={closeWidget} />
        )}
        {ws.activeWidget === "todos" && (
          <TodoWidget
            todos={ws.todos}
            onAddTodo={ws.addTodo}
            onToggleTodo={ws.toggleTodo}
            onDeleteTodo={ws.deleteTodo}
            onClose={closeWidget}
          />
        )}
        {ws.activeWidget === "favorites" && (
          <FavoritesWidget
            favorites={ws.favorites}
            onAddFavorite={ws.addFavorite}
            onDeleteFavorite={ws.deleteFavorite}
            onOpenUrl={ws.openUrl}
            onClose={closeWidget}
          />
        )}
      </div>

      {/* ── Widget Dock (right edge, auto-hide) ──────────────────────────── */}
      <WidgetDock
        activeWidget={ws.activeWidget}
        onToggleWidget={handleToggleWidget}
        onToggleMini={handleToggleMini}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* ── Control Bar (bottom, auto-hide on hover) ─────────────────────── */}
      <ControlBar
        onSendCommand={ws.sendCommand}
        onToggleMute={ws.toggleMute}
        isMuted={ws.state === "MUTED"}
        connected={ws.connected}
      />

      {/* ── Settings Dialog (Radix) ──────────────────────────────────────── */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        config={ws.config}
        onConfigChange={handleConfigChange}
        onSave={handleSaveConfig}
        audioDevices={ws.audioDevices}
        modelsList={ws.modelsList}
        agentStatus={ws.agentStatus}
        onRequestDevices={ws.requestAudioDevices}
        onRequestModels={ws.requestModels}
        onRequestStatus={ws.requestAgentStatus}
        onKillAgent={ws.killAgent}
        onRestartAgent={ws.restartAgent}
      />
    </div>
  );
}
