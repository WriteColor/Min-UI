"use client";

import { useState, useCallback, useEffect } from "react";
import Orb from "../components/Orb";
import { ControlBar } from "../components/ControlBar";
import { SidebarDock } from "../components/SidebarDock";
import { SettingsDialog } from "../components/SettingsDialog";
import { Chat } from "../components/Chat";

import { ClockWidget } from "../components/widgets/ClockWidget";
import { WeatherWidget } from "../components/widgets/WeatherWidget";
import { MusicWidget } from "../components/widgets/MusicWidget";
import { TodoWidget } from "../components/widgets/TodoWidget";
import { FavoritesWidget } from "../components/widgets/FavoritesWidget";

import { useWebSocket } from "../hooks/useWebSocket";
import type { MinConfig, WidgetType } from "../types";
import { Terminal, AlertTriangle, RefreshCw, X } from "lucide-react";

export default function Home() {
  const ws = useWebSocket();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [mounted, setMounted] = useState(false);

  const [booting, setBooting] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [offlineDismissed, setOfflineDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).__TAURI_INTERNALS__)
      return;

    let unlisten: (() => void) | undefined;

    import("@tauri-apps/api/event").then(({ listen }) => {
      listen<any>("tauri://drag-drop", (event) => {
        const paths = event.payload?.paths;
        if (paths && paths.length > 0) {
          const droppedFile = paths[0];
          ws.setFile(droppedFile);
        }
      }).then((unsub) => {
        unlisten = unsub;
      });
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [ws]);

  const handleToggleWidget = useCallback(
    (widget: WidgetType) => {
      ws.setActiveWidget(ws.activeWidget === widget ? null : widget);
    },
    [ws]
  );

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

  const handleStartAgent = async () => {
    setBooting(true);
    setBootLog((prev) => [
      ...prev,
      "[SYS] Inicializando secuencia de arranque...",
    ]);

    if (
      typeof window === "undefined" ||
      !(window as any).__TAURI_INTERNALS__
    ) {
      setTimeout(() => {
        setBootLog((prev) => [
          ...prev,
          "[ERR] El entorno actual no soporta Tauri.",
          "[INFO] Inicie el backend ejecutando 'python main.py'",
        ]);
        setBooting(false);
      }, 1500);
      return;
    }

    try {
      setBootLog((prev) => [...prev, "[SYS] Buscando kernel python..."]);
      const { invoke } = await import("@tauri-apps/api/core");
      const res = await invoke<string>("start_agent");
      setBootLog((prev) => [...prev, `[OK] ${res}`]);

      setTimeout(() => {
        ws.requestAgentStatus();
        setBooting(false);
      }, 3000);
    } catch (err: any) {
      setBootLog((prev) => [...prev, `[ERR] Falló el arranque: ${err}`]);
      setBooting(false);
    }
  };

  if (!mounted) return null;

  return (
    <main
      className="relative h-screen w-screen overflow-hidden font-sans"
    >
      {/* Dot grid background */}
      <div className="absolute inset-0 dots-grid opacity-50" />

      {/* Central orb area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Orb container */}
        <div className="relative flex h-[280px] w-[280px] items-center justify-center md:h-[340px] md:w-[340px]">
          <Orb state={ws.state} volume={ws.audioLevel} />

          {/* Subtle glow under orb */}
          <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* State indicator */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <span
            className="animate-fade-in text-xs font-medium tracking-widest uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            {ws.state === "LISTENING" && "Escuchando..."}
            {ws.state === "THINKING" && "Pensando..."}
            {ws.state === "SPEAKING" && "Hablando..."}
            {ws.state === "MUTED" && "Silenciado"}
            {ws.state === "SUSPENDED" && "Suspendido"}
            {ws.state === "OFFLINE" && "Desconectado"}
          </span>
          {ws.connected && ws.state !== "OFFLINE" && (
            <div className="h-1 w-1 rounded-full bg-accent opacity-60" />
          )}
        </div>
      </div>

      {/* Sidebar dock */}
      <SidebarDock
        activeWidget={ws.activeWidget}
        onToggleWidget={handleToggleWidget}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Active widget container */}
      {ws.activeWidget && (
        <div className="fixed right-20 top-1/2 z-30 -translate-y-1/2 animate-slide-in-right max-md:bottom-24 max-md:right-1/2 max-md:top-auto max-md:translate-x-1/2 max-md:-translate-y-0">
          {ws.activeWidget === "clock" && (
            <ClockWidget onClose={() => ws.setActiveWidget(null)} />
          )}
          {ws.activeWidget === "weather" && (
            <WeatherWidget
              data={ws.weatherData}
              onClose={() => ws.setActiveWidget(null)}
            />
          )}
          {ws.activeWidget === "music" && (
            <MusicWidget
              mediaInfo={ws.mediaInfo}
              onMediaControl={ws.sendMediaControl}
              onClose={() => ws.setActiveWidget(null)}
            />
          )}
          {ws.activeWidget === "todos" && (
            <TodoWidget
              todos={ws.todos}
              onAddTodo={ws.addTodo}
              onToggleTodo={ws.toggleTodo}
              onDeleteTodo={ws.deleteTodo}
              onClose={() => ws.setActiveWidget(null)}
            />
          )}
          {ws.activeWidget === "favorites" && (
            <FavoritesWidget
              favorites={ws.favorites}
              onAddFavorite={ws.addFavorite}
              onDeleteFavorite={ws.deleteFavorite}
              onOpenUrl={ws.openUrl}
              onClose={() => ws.setActiveWidget(null)}
            />
          )}
        </div>
      )}

      {/* Control bar */}
      <ControlBar
        onSendCommand={ws.sendCommand}
        onToggleMute={ws.toggleMute}
        isMuted={ws.state === "MUTED"}
        connected={ws.connected}
        audioLevel={ws.audioLevel}
        currentFile={ws.currentFile}
        onClearFile={() => ws.setFile("")}
        onSelectFile={(path) => ws.setFile(path)}
        onOpenChat={() => setChatOpen(true)}
      />

      {/* Chat panel */}
      <Chat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        transcription={transcription}
        onSendMessage={ws.sendCommand}
      />

      {/* Settings dialog */}
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

      {/* Connection offline overlay */}
      {!ws.connected && !offlineDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="panel w-full max-w-md space-y-5 p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setOfflineDismissed(true)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Sin conexión
                </h2>
                <p className="text-xs text-text-muted">
                  No se puede conectar al backend
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-text-secondary">
              La interfaz no ha podido establecer conexión con el servidor
              WebSocket. Esto sucede cuando el asistente de fondo no está
              corriendo.
            </p>

            {/* Boot log */}
            <div className="h-28 overflow-y-auto rounded-lg bg-surface-elevated p-3 font-mono text-xs text-text-muted">
              <div>[SYS] Puerto websocket 8765 cerrado.</div>
              {bootLog.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                disabled={booting}
                onClick={handleStartAgent}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {booting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Terminal className="h-4 w-4" />
                )}
                Arrancar Core
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="btn btn-secondary"
              >
                Ajustes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
