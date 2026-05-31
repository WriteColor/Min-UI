"use client";

import { useEffect, useState, useRef } from "react";
import {
  User,
  Key,
  MapPin,
  Cpu,
  Monitor,
  Save,
  RefreshCw,
  Power,
  Eye,
  Accessibility,
  Grid,
  ChevronRight,
  Plus,
  Trash2,
  EyeOff,
  X,
  Settings,
  Play,
} from "lucide-react";
import { MIN_VOICES } from "../types";
import type { MinConfig, AudioDevice, ModelEntry, AgentStatus } from "../types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: Partial<MinConfig>;
  onConfigChange: (key: string, value: unknown) => void;
  onSave: () => void;
  audioDevices: { microphones: AudioDevice[]; speakers: AudioDevice[] };
  modelsList: { gemini: ModelEntry[]; openrouter: ModelEntry[] };
  agentStatus: AgentStatus | null;
  onRequestDevices: () => void;
  onRequestModels: () => void;
  onRequestStatus: () => void;
  onKillAgent: () => void;
  onRestartAgent: () => void;
}

const TAB_ITEMS = [
  { id: "assistant", label: "Asistente", icon: User, desc: "Voz, navegador y cámara" },
  { id: "guardian", label: "Guardián", icon: Eye, desc: "Análisis pasivo de pantalla" },
  { id: "accessibility", label: "Accesibilidad", icon: Accessibility, desc: "Asistencia cognitiva" },
  { id: "api_keys", label: "API Keys", icon: Key, desc: "Claves de servicios cloud" },
  { id: "location", label: "Ubicación", icon: MapPin, desc: "Zona horaria y clima" },
  { id: "llm_kernel", label: "LLM Local", icon: Cpu, desc: "Jan AI, LM Studio, Ollama" },
  { id: "registry", label: "Apps", icon: Grid, desc: "Accesos directos" },
  { id: "profile", label: "Perfil", icon: User, desc: "Datos del operador" },
  { id: "system", label: "Sistema", icon: Monitor, desc: "Proceso y telemetría" },
];

export function SettingsDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onSave,
  audioDevices,
  modelsList,
  agentStatus,
  onRequestDevices,
  onRequestModels,
  onRequestStatus,
  onKillAgent,
  onRestartAgent,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("assistant");
  const [newAppAlias, setNewAppAlias] = useState("");
  const [newAppPath, setNewAppPath] = useState("");
  const [newAppType, setNewAppType] = useState<"exe" | "appid">("exe");
  const [starting, setStarting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleStartAgent = async () => {
    if (typeof window === "undefined") return;
    if (!(window as any).__TAURI_INTERNALS__) {
      alert("El entorno actual no soporta Tauri.\n\nInicie el backend ejecutando 'python main.py'");
      return;
    }
    setStarting(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("start_agent");
      setTimeout(() => {
        onRequestStatus();
        setStarting(false);
      }, 2500);
    } catch (err: any) {
      alert("Error al iniciar: " + err);
      setStarting(false);
    }
  };

  useEffect(() => {
    if (open) {
      onRequestDevices();
      onRequestModels();
      onRequestStatus();
    }
  }, [open, onRequestDevices, onRequestModels, onRequestStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleAccessibilityChange = (field: string, val: unknown) => {
    const acc = config.accessibility || {
      task_simplification_enabled: true,
      emotional_regulation_enabled: true,
      routine_gamification_enabled: true,
      eye_tracking_enabled: false,
      micro_movement_enabled: false,
      visual_feedback_enabled: true,
      high_contrast_mode: false,
      auto_learn_routines: true,
      speech_error_threshold: 0.5,
      font_size_scale: 1.0,
    };
    onConfigChange("accessibility", { ...acc, [field]: val });
  };

  const handleVisionGuardianChange = (field: string, val: unknown) => {
    const vg = config.vision_guardian || { enabled: false, interval: 120 };
    onConfigChange("vision_guardian", { ...vg, [field]: val });
  };

  const handleUserProfileChange = (field: string, val: unknown) => {
    const prof = config.user_profile || { name: "Usuario", language: "es" };
    onConfigChange("user_profile", { ...prof, [field]: val });
  };

  const handleAddApp = () => {
    const alias = newAppAlias.trim().toLowerCase();
    const path = newAppPath.trim();
    if (!alias) return;
    const reg = config.app_registry || { apps: {} };
    const apps = { ...reg.apps };
    apps[alias] = { type: newAppType, path: newAppType === "exe" ? path : undefined, id: newAppType === "appid" ? path : undefined };
    onConfigChange("app_registry", { ...reg, apps });
    setNewAppAlias("");
    setNewAppPath("");
  };

  const handleRemoveApp = (alias: string) => {
    const reg = config.app_registry || { apps: {} };
    const apps = { ...reg.apps };
    delete apps[alias];
    onConfigChange("app_registry", { ...reg, apps });
  };

  if (!open) return null;

  // Reusable components
  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <h4 className="text-xs font-medium text-text-secondary">{title}</h4>
      {children}
    </div>
  );

  const InputField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="w-full space-y-1.5">
      <label className="block text-xs text-text-muted">{label}</label>
      {children}
    </div>
  );

  const Switch = ({
    checked,
    onChange,
    label,
    desc,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    desc?: string;
  }) => (
    <div className="flex items-start justify-between rounded-lg border border-border bg-surface-elevated p-3">
      <div className="space-y-0.5 pr-3">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        {desc && <p className="text-xs text-text-muted">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
          checked ? "bg-accent" : "bg-surface-hover"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
          style={{ marginTop: "2px" }}
        />
      </button>
    </div>
  );

  const SecretField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
    const [hidden, setHidden] = useState(true);
    return (
      <InputField label={label}>
        <div className="relative">
          <input
            type={hidden ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input pr-10"
          />
          <button
            type="button"
            onClick={() => setHidden(!hidden)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted transition-colors hover:text-text-primary"
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </InputField>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: "rgba(10, 10, 11, 0.8)" }}
    >
      <div
        ref={modalRef}
        className="flex h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl border shadow-2xl animate-slide-up"
        style={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
      >
        {/* Sidebar */}
        <div
          className="flex w-56 shrink-0 flex-col border-r"
          style={{ backgroundColor: "#27272a", borderColor: "#27272a" }}
        >
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">Ajustes</span>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
            {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === id
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {activeTab === id && <ChevronRight className="ml-auto h-3 w-3" />}
              </button>
            ))}
          </nav>

          {/* Process status */}
          {agentStatus && (
            <div className="border-t border-border p-3">
              <div className="rounded-md bg-surface p-2 text-xs">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Estado</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1 text-text-secondary">
                  <span>MEM: {agentStatus.memory_mb}MB</span>
                  <span>PID: {agentStatus.pid}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {TAB_ITEMS.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-text-muted">
                {TAB_ITEMS.find((t) => t.id === activeTab)?.desc}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {/* ASSISTANT TAB */}
            {activeTab === "assistant" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="Voz y navegador">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label="Voz del asistente">
                      <select
                        value={config.min_voice || "Aoede"}
                        onChange={(e) => onConfigChange("min_voice", e.target.value)}
                        className="input"
                      >
                        <optgroup label="Voces Femeninas">
                          {Object.entries(MIN_VOICES)
                            .filter(([, meta]) => meta[0] === "Femenina")
                            .map(([name, meta]) => (
                              <option key={name} value={name}>{name} - {meta[1]}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Voces Masculinas">
                          {Object.entries(MIN_VOICES)
                            .filter(([, meta]) => meta[0] === "Masculina")
                            .map(([name, meta]) => (
                              <option key={name} value={name}>{name} - {meta[1]}</option>
                            ))}
                        </optgroup>
                      </select>
                    </InputField>
                    <InputField label="Navegador">
                      <select
                        value={config.browser_preference || "auto"}
                        onChange={(e) => onConfigChange("browser_preference", e.target.value)}
                        className="input"
                      >
                        <option value="auto">Autodetectar</option>
                        <option value="chrome">Chrome</option>
                        <option value="brave">Brave</option>
                        <option value="edge">Edge</option>
                        <option value="firefox">Firefox</option>
                      </select>
                    </InputField>
                  </div>
                </Card>

                <Card title="Cámara">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Switch
                      checked={config.camera_enabled ?? true}
                      onChange={(v) => onConfigChange("camera_enabled", v)}
                      label="Habilitar cámara"
                      desc="Permite capturas de video"
                    />
                    <InputField label="Índice de cámara">
                      <input
                        type="number"
                        min={0}
                        max={9}
                        value={config.camera_index ?? 0}
                        onChange={(e) => onConfigChange("camera_index", parseInt(e.target.value) || 0)}
                        className="input"
                      />
                    </InputField>
                  </div>
                </Card>
              </div>
            )}

            {/* GUARDIAN TAB */}
            {activeTab === "guardian" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="Guardián de visión">
                  <Switch
                    checked={config.vision_guardian?.enabled ?? false}
                    onChange={(v) => handleVisionGuardianChange("enabled", v)}
                    label="Activar guardián"
                    desc="Análisis pasivo de pantalla para soporte cognitivo"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Intervalo de escaneo</span>
                      <span className="font-medium text-text-primary">{config.vision_guardian?.interval ?? 120}s</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={600}
                      step={10}
                      value={config.vision_guardian?.interval ?? 120}
                      onChange={(e) => handleVisionGuardianChange("interval", parseInt(e.target.value) || 120)}
                      className="w-full"
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* ACCESSIBILITY TAB */}
            {activeTab === "accessibility" && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Switch
                    checked={config.accessibility?.task_simplification_enabled ?? true}
                    onChange={(v) => handleAccessibilityChange("task_simplification_enabled", v)}
                    label="Simplificar tareas"
                    desc="Desglosa instrucciones complejas"
                  />
                  <Switch
                    checked={config.accessibility?.emotional_regulation_enabled ?? true}
                    onChange={(v) => handleAccessibilityChange("emotional_regulation_enabled", v)}
                    label="Control de estrés"
                    desc="Ajusta el tono según el estrés"
                  />
                  <Switch
                    checked={config.accessibility?.routine_gamification_enabled ?? true}
                    onChange={(v) => handleAccessibilityChange("routine_gamification_enabled", v)}
                    label="Gamificar rutinas"
                    desc="Insignias al cumplir tareas"
                  />
                  <Switch
                    checked={config.accessibility?.eye_tracking_enabled ?? false}
                    onChange={(v) => handleAccessibilityChange("eye_tracking_enabled", v)}
                    label="Eye Tracking"
                    desc="Navegación sin manos"
                  />
                  <Switch
                    checked={config.accessibility?.micro_movement_enabled ?? false}
                    onChange={(v) => handleAccessibilityChange("micro_movement_enabled", v)}
                    label="Gestos faciales"
                    desc="Control por micro-gestos"
                  />
                  <Switch
                    checked={config.accessibility?.high_contrast_mode ?? false}
                    onChange={(v) => handleAccessibilityChange("high_contrast_mode", v)}
                    label="Alto contraste"
                    desc="Mayor luminosidad"
                  />
                </div>

                <Card title="Voz y fuentes">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-muted">Umbral de error de voz</span>
                        <span className="font-medium text-text-primary">{config.accessibility?.speech_error_threshold ?? 0.5}</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={0.9}
                        step={0.05}
                        value={config.accessibility?.speech_error_threshold ?? 0.5}
                        onChange={(e) => handleAccessibilityChange("speech_error_threshold", parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-muted">Escala de fuentes</span>
                        <span className="font-medium text-text-primary">{config.accessibility?.font_size_scale ?? 1.0}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.8}
                        max={1.5}
                        step={0.05}
                        value={config.accessibility?.font_size_scale ?? 1.0}
                        onChange={(e) => handleAccessibilityChange("font_size_scale", parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* API KEYS TAB */}
            {activeTab === "api_keys" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="Proveedor LLM">
                  <InputField label="Proveedor activo">
                    <select
                      value={config.llm_provider || "gemini"}
                      onChange={(e) => onConfigChange("llm_provider", e.target.value)}
                      className="input"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="minimax">MiniMax</option>
                      <option value="ollama_cloud">Ollama Cloud</option>
                      <option value="nvidia_nim">NVIDIA NIM</option>
                      <option value="compatible_local_openai">OpenAI Local</option>
                    </select>
                  </InputField>
                </Card>

                <Card title="MiniMax">
                  <SecretField
                    label="API Key"
                    value={config.minimax_api_key || ""}
                    onChange={(v) => onConfigChange("minimax_api_key", v)}
                  />
                  <InputField label="Modelo">
                    <select
                      value={config.minimax_llm_model || "MiniMax-M2.7"}
                      onChange={(e) => onConfigChange("minimax_llm_model", e.target.value)}
                      className="input"
                    >
                      <option value="MiniMax-M2.7">MiniMax-M2.7</option>
                      <option value="MiniMax-M2.7-highspeed">MiniMax-M2.7 Highspeed</option>
                      <option value="MiniMax-M2.5">MiniMax-M2.5</option>
                      <option value="MiniMax-M2.1">MiniMax-M2.1</option>
                    </select>
                  </InputField>
                </Card>

                <Card title="Ollama Cloud">
                  <SecretField
                    label="API Key"
                    value={config.ollama_cloud_api_key || ""}
                    onChange={(v) => onConfigChange("ollama_cloud_api_key", v)}
                  />
                  <InputField label="Modelo">
                    <select
                      value={config.ollama_cloud_model || "nemotron-3-super:cloud"}
                      onChange={(e) => onConfigChange("ollama_cloud_model", e.target.value)}
                      className="input"
                    >
                      <option value="nemotron-3-super:cloud">Nemotron 3 Super</option>
                      <option value="gemma4:31b-cloud">Gemma 4 31B</option>
                      <option value="llama3.2:70b-cloud">Llama 3.2 70B</option>
                      <option value="qwen2.5:72b-cloud">Qwen 2.5 72B</option>
                    </select>
                  </InputField>
                </Card>

                <Card title="NVIDIA NIM">
                  <SecretField
                    label="API Key"
                    value={config.nvidia_nim_api_key || ""}
                    onChange={(v) => onConfigChange("nvidia_nim_api_key", v)}
                  />
                  <InputField label="Modelo">
                    <select
                      value={config.nvidia_nim_model || "meta/llama-3.1-70b-instruct"}
                      onChange={(e) => onConfigChange("nvidia_nim_model", e.target.value)}
                      className="input"
                    >
                      <option value="meta/llama-3.1-405b-instruct">Llama 3.1 405B</option>
                      <option value="meta/llama-3.1-70b-instruct">Llama 3.1 70B</option>
                      <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B</option>
                      <option value="mistralai/mixtral-8x7b-instruct-v0.1">Mixtral 8x7B</option>
                    </select>
                  </InputField>
                </Card>

                <Card title="Gemini y OpenRouter">
                  <SecretField
                    label="Gemini API Key"
                    value={config.gemini_api_key || ""}
                    onChange={(v) => onConfigChange("gemini_api_key", v)}
                  />
                  <SecretField
                    label="OpenRouter API Key"
                    value={config.openrouter_api_key || ""}
                    onChange={(v) => onConfigChange("openrouter_api_key", v)}
                  />
                </Card>

                <Card title="Spotify">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SecretField
                      label="Client ID"
                      value={config.spotify_client_id || ""}
                      onChange={(v) => onConfigChange("spotify_client_id", v)}
                    />
                    <SecretField
                      label="Client Secret"
                      value={config.spotify_client_secret || ""}
                      onChange={(v) => onConfigChange("spotify_client_secret", v)}
                    />
                  </div>
                  <InputField label="Redirect URI">
                    <input
                      type="text"
                      value={config.spotify_redirect_uri || "http://127.0.0.1:8888/callback"}
                      onChange={(e) => onConfigChange("spotify_redirect_uri", e.target.value)}
                      className="input"
                    />
                  </InputField>
                </Card>
              </div>
            )}

            {/* LOCATION TAB */}
            {activeTab === "location" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="Ubicación">
                  <InputField label="Modo">
                    <select
                      value={config.location_mode || "system"}
                      onChange={(e) => onConfigChange("location_mode", e.target.value)}
                      className="input"
                    >
                      <option value="system">Automático (IP)</option>
                      <option value="manual">Manual</option>
                    </select>
                  </InputField>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <InputField label="Ciudad">
                      <input
                        type="text"
                        value={config.location_city || ""}
                        onChange={(e) => onConfigChange("location_city", e.target.value)}
                        placeholder="Honduras"
                        className="input"
                      />
                    </InputField>
                    <InputField label="Latitud">
                      <input
                        type="text"
                        value={config.location_lat || ""}
                        onChange={(e) => onConfigChange("location_lat", e.target.value)}
                        placeholder="14.0"
                        className="input"
                      />
                    </InputField>
                    <InputField label="Longitud">
                      <input
                        type="text"
                        value={config.location_lon || ""}
                        onChange={(e) => onConfigChange("location_lon", e.target.value)}
                        placeholder="-87.0"
                        className="input"
                      />
                    </InputField>
                  </div>

                  <InputField label="Zona horaria">
                    <input
                      type="text"
                      value={config.timezone || ""}
                      onChange={(e) => onConfigChange("timezone", e.target.value)}
                      placeholder="America/Tegucigalpa"
                      className="input"
                    />
                  </InputField>
                </Card>
              </div>
            )}

            {/* LLM KERNEL TAB */}
            {activeTab === "llm_kernel" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="OpenAI Local (Jan AI / LM Studio)">
                  <InputField label="URL Base">
                    <input
                      type="text"
                      value={config.compatible_local_openai_base_url || "http://127.0.0.1:1337/v1"}
                      onChange={(e) => onConfigChange("compatible_local_openai_base_url", e.target.value)}
                      className="input"
                    />
                  </InputField>
                  <InputField label="Modelo">
                    <input
                      type="text"
                      value={config.compatible_local_openai_model || "mistral-7b-instruct"}
                      onChange={(e) => onConfigChange("compatible_local_openai_model", e.target.value)}
                      className="input"
                    />
                  </InputField>
                  <SecretField
                    label="API Key (opcional)"
                    value={config.compatible_local_openai_api_key || ""}
                    onChange={(v) => onConfigChange("compatible_local_openai_api_key", v)}
                  />
                  <Switch
                    checked={config.compatible_local_openai_reasoning ?? false}
                    onChange={(v) => onConfigChange("compatible_local_openai_reasoning", v)}
                    label="Modo razonamiento"
                    desc="Soporta razonamientos secuenciales"
                  />
                </Card>

                <Card title="Dispositivos de audio">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label="Micrófono">
                      <select
                        value={config.mic_device || "auto"}
                        onChange={(e) => onConfigChange("mic_device", e.target.value)}
                        className="input"
                      >
                        <option value="auto">Autodetectar</option>
                        {audioDevices.microphones.map((dev) => (
                          <option key={dev.index} value={dev.name}>
                            {dev.name} ({dev.channels_in} in)
                          </option>
                        ))}
                      </select>
                    </InputField>
                    <InputField label="Altavoz">
                      <select
                        value={config.speaker_device || "auto"}
                        onChange={(e) => onConfigChange("speaker_device", e.target.value)}
                        className="input"
                      >
                        <option value="auto">Autodetectar</option>
                        {audioDevices.speakers.map((dev) => (
                          <option key={dev.index} value={dev.name}>
                            {dev.name} ({dev.channels_out} out)
                          </option>
                        ))}
                      </select>
                    </InputField>
                  </div>
                </Card>
              </div>
            )}

            {/* REGISTRY TAB */}
            {activeTab === "registry" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="Registro de aplicaciones">
                  <div className="flex items-end gap-2">
                    <InputField label="Alias">
                      <input
                        type="text"
                        placeholder="steam, spotify..."
                        value={newAppAlias}
                        onChange={(e) => setNewAppAlias(e.target.value)}
                        className="input"
                      />
                    </InputField>
                    <InputField label="Tipo">
                      <select
                        value={newAppType}
                        onChange={(e) => setNewAppType(e.target.value as any)}
                        className="input"
                      >
                        <option value="exe">Ejecutable</option>
                        <option value="appid">App ID</option>
                      </select>
                    </InputField>
                    <button
                      type="button"
                      onClick={handleAddApp}
                      className="btn btn-secondary h-[42px] w-[42px] p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <InputField label="Ruta o App ID">
                    <input
                      type="text"
                      placeholder={newAppType === "exe" ? "C:\\...\\app.exe" : "spotify"}
                      value={newAppPath}
                      onChange={(e) => setNewAppPath(e.target.value)}
                      className="input"
                    />
                  </InputField>

                  <div className="mt-4 max-h-[200px] overflow-y-auto rounded-lg border border-border bg-surface-elevated">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-text-muted">
                          <th className="px-3 py-2">Alias</th>
                          <th className="px-3 py-2">Tipo</th>
                          <th className="px-3 py-2">Destino</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(config.app_registry?.apps || {}).map(([alias, val]) => (
                          <tr key={alias} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 font-medium text-text-primary">{alias}</td>
                            <td className="px-3 py-2 text-xs text-text-muted uppercase">{val.type}</td>
                            <td className="max-w-[200px] truncate px-3 py-2 text-text-secondary">{val.path || val.id}</td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveApp(alias)}
                                className="cursor-pointer p-1 text-text-muted transition-colors hover:text-danger"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {Object.keys(config.app_registry?.apps || {}).length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-sm text-text-muted">
                              Sin aplicaciones registradas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="Datos del operador">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label="Nombre">
                      <input
                        type="text"
                        value={config.user_profile?.name || "Usuario"}
                        onChange={(e) => handleUserProfileChange("name", e.target.value)}
                        className="input"
                      />
                    </InputField>
                    <InputField label="Idioma">
                      <select
                        value={config.user_profile?.language || "es"}
                        onChange={(e) => handleUserProfileChange("language", e.target.value)}
                        className="input"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </InputField>
                  </div>
                </Card>
              </div>
            )}

            {/* SYSTEM TAB */}
            {activeTab === "system" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="Estado del sistema">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-surface-elevated p-3">
                      <div className="text-xs text-text-muted">Uptime</div>
                      {agentStatus ? (
                        <div className="mt-1 text-lg font-semibold text-text-primary">
                          {Math.floor(agentStatus.uptime_seconds / 60)}m {agentStatus.uptime_seconds % 60}s
                        </div>
                      ) : (
                        <div className="mt-1 text-lg font-semibold text-danger">Offline</div>
                      )}
                    </div>
                    <div className="rounded-lg bg-surface-elevated p-3">
                      <div className="text-xs text-text-muted">Python</div>
                      <div className="mt-1 text-lg font-semibold text-text-primary">
                        {agentStatus ? agentStatus.python_version.split(" ")[0] : "---"}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Control del proceso">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      disabled={starting || !!agentStatus}
                      onClick={handleStartAgent}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" />
                      Arrancar
                    </button>
                    <button
                      type="button"
                      disabled={!agentStatus}
                      onClick={onRestartAgent}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reiniciar
                    </button>
                    <button
                      type="button"
                      disabled={!agentStatus}
                      onClick={onKillAgent}
                      className="flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 text-sm font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
                    >
                      <Power className="h-4 w-4" />
                      Detener
                    </button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between border-t border-border bg-surface-elevated px-6 py-4">
            <span className="text-xs text-text-muted">MIN Assistant</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSave}
                className="btn btn-primary"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
