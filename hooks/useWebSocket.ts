import { useState, useEffect, useRef, useCallback } from "react";
import type {
  AssistantState,
  WeatherData,
  MediaInfo,
  TodoItem,
  FavoriteItem,
  MinConfig,
  WSMessage,
  AudioDevice,
  ModelEntry,
  AgentStatus,
} from "../types";

const WS_URL = "ws://127.0.0.1:8765";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<AssistantState>("MUTED");
  const [audioLevel, setAudioLevel] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [config, setConfig] = useState<Partial<MinConfig>>({});
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState("");

  // Device / model lists (fetched on demand)
  const [audioDevices, setAudioDevices] = useState<{
    microphones: AudioDevice[];
    speakers: AudioDevice[];
  }>({ microphones: [], speakers: [] });
  const [modelsList, setModelsList] = useState<{
    gemini: ModelEntry[];
    openrouter: ModelEntry[];
  }>({ gemini: [], openrouter: [] });
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === msg) return prev;
      const next = [...prev, msg];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  // Tauri window control handler
  const handleTauriControl = useCallback(async (action: string) => {
    if (typeof window === "undefined" || !(window as any).__TAURI_INTERNALS__) return;
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      switch (action) {
        case "minimize":
          await win.minimize();
          break;
        case "restore":
          await win.unminimize();
          break;
        case "focus":
          await win.setFocus();
          break;
        case "shutdown":
          await win.close();
          break;
      }
    } catch (err) {
      console.error("[useWebSocket] Tauri control error:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        addLog("[WS] Conectado al backend de MIN.");
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => ws.close();

      ws.onmessage = (evt) => {
        try {
          const msg: WSMessage = JSON.parse(evt.data);

          switch (msg.type) {
            case "state":
              if (msg.value) setState(msg.value as AssistantState);
              break;
            case "volume":
              if (msg.level !== undefined) setAudioLevel(msg.level);
              break;
            case "log":
              if (msg.value) {
                if (msg.value.startsWith("config_loaded:")) {
                  try {
                    const cfgData = JSON.parse(
                      msg.value.replace("config_loaded:", "")
                    );
                    setConfig(cfgData);
                  } catch {
                    /* ignore parse errors */
                  }
                } else {
                  addLog(msg.value);
                }
              }
              break;
            case "weather":
              if (msg.data) {
                setWeatherData(msg.data as WeatherData);
                setActiveWidget("weather");
              }
              break;
            case "media":
              if (msg.data) {
                setMediaInfo(msg.data as MediaInfo);
              } else if (msg.app) {
                setMediaInfo({
                  app: msg.app,
                  title: msg.title || "",
                  artist: msg.artist || "",
                });
              }
              break;
            case "todos":
              if (msg.data) setTodos(msg.data as TodoItem[]);
              else if (msg.value) setTodos(msg.value as unknown as TodoItem[]);
              break;
            case "favorites":
              if (msg.data) setFavorites(msg.data as FavoriteItem[]);
              else if (msg.value)
                setFavorites(msg.value as unknown as FavoriteItem[]);
              break;
            case "open_widget":
              if (msg.value) setActiveWidget(msg.value);
              break;
            case "audio_devices":
              if (msg.data)
                setAudioDevices(
                  msg.data as {
                    microphones: AudioDevice[];
                    speakers: AudioDevice[];
                  }
                );
              break;
            case "models_list":
              if (msg.data)
                setModelsList(
                  msg.data as {
                    gemini: ModelEntry[];
                    openrouter: ModelEntry[];
                  }
                );
              break;
            case "agent_status":
              if (msg.data) setAgentStatus(msg.data as AgentStatus);
              break;
            case "ui_control":
              handleTauriControl(msg.action || "");
              break;
          }
        } catch {
          /* ignore invalid JSON */
        }
      };
    }

    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [addLog, handleTauriControl]);

  // ── Public API ──────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => send({ type: "toggle_mute" }), [send]);
  const sendCommand = useCallback(
    (text: string) => send({ type: "command", value: text }),
    [send]
  );
  const sendMediaControl = useCallback(
    (action: string) => send({ type: "media_control", action }),
    [send]
  );
  const saveConfig = useCallback(
    (cfg: Partial<MinConfig>) => send({ type: "save_config", config: cfg }),
    [send]
  );
  const reconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  // Todo operations
  const addTodo = useCallback(
    (title: string, priority: string) =>
      send({ type: "add_todo", title, priority }),
    [send]
  );
  const toggleTodo = useCallback(
    (id: string) => send({ type: "toggle_todo", id }),
    [send]
  );
  const deleteTodo = useCallback(
    (id: string) => send({ type: "delete_todo", id }),
    [send]
  );

  // Favorite operations
  const addFavorite = useCallback(
    (title: string, url: string) =>
      send({ type: "add_favorite", title, url }),
    [send]
  );
  const deleteFavorite = useCallback(
    (url: string) => send({ type: "delete_favorite", url }),
    [send]
  );
  const openUrl = useCallback(
    (url: string) => send({ type: "open_url", url }),
    [send]
  );

  const setFile = useCallback(
    (path: string) => {
      setCurrentFile(path);
      send({ type: "set_file", value: path });
    },
    [send]
  );

  // Device/model requests
  const requestAudioDevices = useCallback(
    () => send({ type: "list_audio_devices" }),
    [send]
  );
  const requestModels = useCallback(
    () => send({ type: "list_models" }),
    [send]
  );
  const requestAgentStatus = useCallback(
    () => send({ type: "agent_status" }),
    [send]
  );
  const killAgent = useCallback(
    () => send({ type: "agent_kill" }),
    [send]
  );
  const restartAgent = useCallback(
    () => send({ type: "agent_restart" }),
    [send]
  );

  return {
    // Connection state
    connected,
    state,
    audioLevel,
    logs,

    // Data
    weatherData,
    mediaInfo,
    todos,
    favorites,
    config,
    audioDevices,
    modelsList,
    agentStatus,

    // Widget
    activeWidget,
    setActiveWidget,
    currentFile,
    setFile,

    // Actions
    toggleMute,
    sendCommand,
    sendMediaControl,
    saveConfig,
    reconnect,
    setConfig,

    // Todos
    addTodo,
    toggleTodo,
    deleteTodo,

    // Favorites
    addFavorite,
    deleteFavorite,
    openUrl,

    // Device/model/agent
    requestAudioDevices,
    requestModels,
    requestAgentStatus,
    killAgent,
    restartAgent,
  };
}
