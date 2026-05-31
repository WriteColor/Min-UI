"use client";

import { useState, useCallback, useEffect } from "react";
import Orb from "../components/Orb";
import { ControlBar } from "../components/ControlBar";
import { SidebarDock } from "../components/SidebarDock";
import { SettingsDialog } from "../components/SettingsDialog";
import { Chat } from "../components/Chat";

// Widgets
import { ClockWidget } from "../components/widgets/ClockWidget";
import { WeatherWidget } from "../components/widgets/WeatherWidget";
import { MusicWidget } from "../components/widgets/MusicWidget";
import { TodoWidget } from "../components/widgets/TodoWidget";
import { FavoritesWidget } from "../components/widgets/FavoritesWidget";

import { useWebSocket } from "../hooks/useWebSocket";
import type { MinConfig, WidgetType } from "../types";
import { Terminal, Shield, RefreshCw } from "lucide-react";

export default function Home() {
  const ws = useWebSocket();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [mounted, setMounted] = useState(false);

  const [booting, setBooting] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);

  // Set mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to Tauri native drag-and-drop file events
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).__TAURI_INTERNALS__) return;
    
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
    setBootLog((prev) => [...prev, "[SYS_BOOT]: Inicializando secuencia de arranque..."]);
    
    if (typeof window === "undefined" || !(window as any).__TAURI_INTERNALS__) {
      setTimeout(() => {
        setBootLog((prev) => [
          ...prev,
          "[SYS_ERR]: El entorno actual no soporta Tauri (Prueba en navegador web).",
          "[SYS_INFO]: Inicie el backend ejecutando 'python main.py' en la raíz del proyecto."
        ]);
        setBooting(false);
      }, 1500);
      return;
    }

    try {
      setBootLog((prev) => [...prev, "[SYS_BOOT]: Buscando kernel python..."]);
      const { invoke } = await import("@tauri-apps/api/core");
      const res = await invoke<string>("start_agent");
      setBootLog((prev) => [...prev, `[SYS_OK]: ${res}`]);
      
      setTimeout(() => {
        ws.requestAgentStatus();
        setBooting(false);
      }, 3000);
    } catch (err: any) {
      setBootLog((prev) => [...prev, `[SYS_ERR]: Falló el arranque: ${err}`]);
      setBooting(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-transparent text-slate-900 font-sans select-none">
      {/* 1. Backdrop Grid and Scanlines */}
      <div className="hud-grid" />
      <div className="hud-scanline" />

      {/* 2. Interactive Central Fusing Core (Reactor Layout) */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="relative h-[300px] w-[300px] md:h-[380px] md:w-[380px] rounded-full border border-slate-200/80 bg-white/60 backdrop-blur-md flex items-center justify-center shadow-[0_35px_80px_rgba(15,23,42,0.12)]">
          {/* Orbital Telemetry Rings */}
          <div className="absolute inset-0 rounded-full border border-slate-300/60 border-dashed animate-spin-slow" />
          <div className="absolute inset-5 rounded-full border border-dashed border-slate-200/70 animate-spin-reverse-slow" />
          <div className="absolute inset-10 rounded-full border border-slate-200/40 flex items-center justify-center">
            <div className="absolute h-full w-full rounded-full border-b border-teal-400/50 animate-spin" style={{ animationDuration: "22s" }} />
          </div>
          
          {/* 3D interactive Canvas container */}
          <div className="h-[240px] w-[240px] md:h-[300px] md:w-[300px] pointer-events-auto">
            <Orb state={ws.state} volume={ws.audioLevel} />
          </div>

          {/* Glowing Aura under core */}
          <div className="absolute h-44 w-44 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* 3. Symmetrical Navigation Sidebar Dock (Right side) */}
      <SidebarDock
        activeWidget={ws.activeWidget}
        onToggleWidget={handleToggleWidget}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* 4. Unified Active Widget Container Slot (Slides in from the right next to the sidebar) */}
      {ws.activeWidget && (
        <div className="fixed right-24 top-1/2 -translate-y-1/2 z-30 widget-slide-in max-md:right-1/2 max-md:translate-x-1/2 max-md:bottom-24 max-md:top-auto max-md:-translate-y-0">
          {ws.activeWidget === "clock" && (
            <ClockWidget onClose={() => ws.setActiveWidget(null)} />
          )}
          {ws.activeWidget === "weather" && (
            <WeatherWidget data={ws.weatherData} onClose={() => ws.setActiveWidget(null)} />
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

      {/* 5. Lower command input bar (Centred floating hover) */}
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

      {/* 5.5 Chat Assistant Panel */}
      <Chat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        transcription={transcription}
        onSendMessage={ws.sendCommand}
      />

      {/* 6. Settings Dialog Modal */}
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

      {/* 7. Connection offline overlay (Diagnostics + Boot Console) */}
      {!ws.connected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/20 backdrop-blur-lg p-4 animate-fade-in pointer-events-auto">
          <div className="hud-panel hud-panel-amber w-full max-w-md p-6 space-y-6 relative">
            <div className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-amber-300" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
              <div className="flex items-center gap-2 text-amber-700">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="text-xs font-bold font-mono tracking-widest">
                  SYS_LINK_ERROR // OFFLINE
                </span>
              </div>
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            </div>

            {/* Explanation */}
            <div className="space-y-2 font-sans text-xs leading-relaxed text-amber-700/70">
              <p>
                La interfaz web de MIN no ha podido establecer conexión con el socket principal. Esto sucede cuando el asistente de fondo no está corriendo.
              </p>
            </div>

            {/* Diagnostic Log */}
            <div className="bg-white/70 border border-amber-200/60 rounded-lg p-3 h-28 overflow-y-auto font-mono text-[0.62rem] text-amber-700/80 space-y-1 select-text">
              <div>[SYS_CONN]: Puerto websocket 8765 cerrado.</div>
              {bootLog.map((log, idx) => (
                <div key={idx} className="transition-all duration-300">{log}</div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                disabled={booting}
                onClick={handleStartAgent}
                className="flex-1 h-9 rounded border border-amber-300 bg-amber-100 text-[0.68rem] font-mono tracking-widest text-amber-800 hover:bg-amber-300 hover:text-amber-950 hover:shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
              >
                {booting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Terminal className="h-3.5 w-3.5" />
                )}
                ARRANCAR CORE
              </button>
            </div>
            
            {/* Direct Bypass Link */}
            <div className="text-center">
              <button 
                onClick={() => setSettingsOpen(true)}
                className="text-[0.62rem] font-mono text-amber-700/60 hover:text-amber-800 transition-colors uppercase tracking-wider underline cursor-pointer"
              >
                Forzar Consola de Ajustes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
