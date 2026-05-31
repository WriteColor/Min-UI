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
  Skull,
  Eye,
  Accessibility,
  Camera,
  Grid,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  EyeOff,
  X,
  Sliders,
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
  {
    id: "assistant",
    label: "Asistente Core",
    icon: User,
    desc: "Voz del núcleo, navegador predeterminado y configuraciones del hardware.",
  },
  {
    id: "guardian",
    label: "Guardián Ocular",
    icon: Eye,
    desc: "Parámetros del guardián de visión e intervalos de escaneo de pantalla.",
  },
  {
    id: "accessibility",
    label: "Accesibilidad",
    icon: Accessibility,
    desc: "Módulos de asistencia cognitiva, motora y filtros de voz de MIN.",
  },
  {
    id: "api_keys",
    label: "IA & Spotify",
    icon: Key,
    desc: "Claves de API en la nube para Gemini, OpenRouter y Spotify API.",
  },
  {
    id: "location",
    label: "Localización",
    icon: MapPin,
    desc: "Zona horaria, geolocalización física y servicios climatológicos.",
  },
  {
    id: "llm_kernel",
    label: "Kernel LLM Local",
    icon: Cpu,
    desc: "Configuración experimental de LLM locales (Jan AI, LM Studio, Ollama).",
  },
  {
    id: "registry",
    label: "Aplicaciones",
    icon: Grid,
    desc: "Registro de accesos rápidos y alias de ejecutables locales.",
  },
  {
    id: "profile",
    label: "Perfil Operador",
    icon: User,
    desc: "Metadatos y hábitos de comportamiento del operador.",
  },
  {
    id: "system",
    label: "Consola de Proceso",
    icon: Monitor,
    desc: "Telemetría del proceso python, memoria del kernel y arranque directo.",
  },
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
      alert("El entorno actual no soporta Tauri.\n\nInicie el backend ejecutando 'python main.py' en la raíz del proyecto.");
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
      alert("Error al iniciar el asistente: " + err);
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

  // ESC key to close
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

  // Custom UI components
  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="relative p-5 rounded-xl border border-purple-500/10 bg-purple-950/5 space-y-4">
      <div className="absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-purple-500/40" />
      <h4 className="text-[0.62rem] font-bold text-purple-400 font-mono tracking-widest uppercase">
        {title}
      </h4>
      {children}
    </div>
  );

  const InputField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5 w-full">
      <label className="block text-[0.62rem] font-bold uppercase tracking-wider text-purple-400/50 font-mono">
        {label}
      </label>
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
    <div className="flex items-start justify-between p-4 rounded-xl border border-purple-500/5 bg-purple-950/5 hover:border-purple-500/15 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 left-0 h-1 w-1 border-t border-l border-purple-500/30 group-hover:border-purple-500/50" />
      <div className="space-y-1 pr-4">
        <label className="text-xs font-bold text-purple-100 font-mono tracking-wide">
          {label.toUpperCase()}
        </label>
        {desc && <p className="text-[0.62rem] text-purple-400/40 leading-relaxed font-sans">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ease-in-out focus:outline-none mt-0.5 ${
          checked
            ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            : "bg-purple-950/40 border border-purple-500/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
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
            className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/50 px-3 pr-10 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
          />
          <button
            type="button"
            onClick={() => setHidden(!hidden)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/40 hover:text-purple-300 transition-colors"
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </InputField>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in pointer-events-auto">
      <div
        ref={modalRef}
        className="max-w-4xl w-full h-[85vh] flex rounded-xl border border-purple-500/20 bg-black/95 shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden animate-slide-up text-purple-100 relative"
      >
        <div className="hud-scanline" />

        {/* Sidebar Nav */}
        <div className="w-60 border-r border-purple-500/10 p-6 flex flex-col justify-between shrink-0 bg-purple-950/5 relative z-10 select-none">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2 font-mono">
                <Sliders className="h-4 w-4 animate-pulse text-purple-400" /> MASTER_PANEL
              </h3>
              <p className="text-[0.62rem] text-purple-400/40 mt-1 leading-relaxed font-sans">
                Consola central de configuración del asistente MIN.
              </p>
            </div>

            <nav className="space-y-1 max-h-[50vh] overflow-y-auto">
              {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left group cursor-pointer ${
                    activeTab === id
                      ? "text-purple-300 bg-purple-500/15 border-l-2 border-purple-500 font-semibold font-mono"
                      : "text-purple-400/40 hover:text-purple-300 hover:bg-purple-500/5 font-sans"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                  <ChevronRight
                    className={`h-3 w-3 transition-all duration-300 ${
                      activeTab === id
                        ? "opacity-100 translate-x-0.5 text-purple-400"
                        : "opacity-0"
                    }`}
                  />
                </button>
              ))}
            </nav>
          </div>

          {/* Process Telemetry Info */}
          {agentStatus && (
            <div className="rounded-lg border border-purple-500/10 bg-purple-950/15 p-3 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[0.55rem] text-purple-400/50 font-bold uppercase tracking-widest">
                <span>CONN_STATE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
              </div>
              <div className="grid grid-cols-2 gap-1 text-[0.62rem] text-purple-300/60">
                <div>MEM: <span className="text-purple-100">{agentStatus.memory_mb}MB</span></div>
                <div>PID: <span className="text-purple-100">{agentStatus.pid}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Content Pane */}
        <div className="flex-grow flex flex-col overflow-hidden bg-black/30 relative z-10">
          <header className="px-8 py-5 border-b border-purple-500/10 flex items-center justify-between shrink-0 select-none">
            <div>
              <h2 className="text-xs font-bold text-white font-mono tracking-widest uppercase">
                {TAB_ITEMS.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-[0.68rem] text-purple-400/40 mt-1 font-sans">
                {TAB_ITEMS.find((t) => t.id === activeTab)?.desc}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-purple-400/50 hover:text-purple-200 hover:bg-purple-500/10 transition-colors duration-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* 1. ASSISTENTE CORE */}
            {activeTab === "assistant" && (
              <div className="space-y-5 animate-fade-in">
                <Card title="VOICE & ENVIRONMENT">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Voz del asistente (TTS)">
                      <select
                        value={config.min_voice || "Aoede"}
                        onChange={(e) => onConfigChange("min_voice", e.target.value)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer transition-all font-mono"
                      >
                        <optgroup label="Voces Femeninas" className="bg-black text-purple-200">
                          {Object.entries(MIN_VOICES)
                            .filter(([, meta]) => meta[0] === "Femenina")
                            .map(([name, meta]) => (
                              <option key={name} value={name}>
                                {name} — {meta[1]}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Voces Masculinas" className="bg-black text-purple-200">
                          {Object.entries(MIN_VOICES)
                            .filter(([, meta]) => meta[0] === "Masculina")
                            .map(([name, meta]) => (
                              <option key={name} value={name}>
                                {name} — {meta[1]}
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </InputField>

                    <InputField label="Preferencia de Navegador">
                      <select
                        value={config.browser_preference || "auto"}
                        onChange={(e) => onConfigChange("browser_preference", e.target.value)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer transition-all font-mono"
                      >
                        <option value="auto" className="bg-black text-purple-200">Autodetectar</option>
                        <option value="chrome" className="bg-black text-purple-200">Google Chrome</option>
                        <option value="brave" className="bg-black text-purple-200">Brave Browser</option>
                        <option value="edge" className="bg-black text-purple-200">Microsoft Edge</option>
                        <option value="firefox" className="bg-black text-purple-200">Mozilla Firefox</option>
                      </select>
                    </InputField>
                  </div>
                </Card>

                <Card title="CAMERA HARDWARE">
                  <div className="grid grid-cols-2 gap-4">
                    <Switch
                      checked={config.camera_enabled ?? true}
                      onChange={(v) => onConfigChange("camera_enabled", v)}
                      label="Capturar Cámara Web"
                      desc="Permite al asistente realizar capturas y videovigilancia."
                    />
                    <InputField label="Índice del dispositivo de cámara">
                      <input
                        type="number"
                        min={0}
                        max={9}
                        value={config.camera_index ?? 0}
                        onChange={(e) => onConfigChange("camera_index", parseInt(e.target.value) || 0)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                      />
                    </InputField>
                  </div>
                </Card>
              </div>
            )}

            {/* 2. GUARDIÁN OCULAR */}
            {activeTab === "guardian" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="VISION PASSIVE SYSTEM">
                  <Switch
                    checked={config.vision_guardian?.enabled ?? false}
                    onChange={(v) => handleVisionGuardianChange("enabled", v)}
                    label="Guardián de Visión Activo"
                    desc="Activa el análisis pasivo de pantalla para avisar al operador si necesita soporte cognitivo."
                  />
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs text-purple-300 font-mono">
                      <span>INTERVALO_ESCANEO_PANTALLA</span>
                      <span className="text-purple-400 font-semibold">
                        {config.vision_guardian?.interval ?? 120}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={600}
                      step={10}
                      value={config.vision_guardian?.interval ?? 120}
                      onChange={(e) => handleVisionGuardianChange("interval", parseInt(e.target.value) || 120)}
                      className="w-full h-1 bg-purple-950/40 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* 3. ACCESIBILIDAD */}
            {activeTab === "accessibility" && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <Switch
                    checked={config.accessibility?.task_simplification_enabled ?? true}
                    onChange={(v) => handleAccessibilityChange("task_simplification_enabled", v)}
                    label="Simplificar tareas"
                    desc="Desglosa instrucciones complejas en subtareas secuenciales."
                  />
                  <Switch
                    checked={config.accessibility?.emotional_regulation_enabled ?? true}
                    onChange={(v) => handleAccessibilityChange("emotional_regulation_enabled", v)}
                    label="Control de estrés"
                    desc="Ajusta el tono de voz de MIN basado en el estrés del operador."
                  />
                  <Switch
                    checked={config.accessibility?.routine_gamification_enabled ?? true}
                    onChange={(v) => handleAccessibilityChange("routine_gamification_enabled", v)}
                    label="Gamificar rutinas"
                    desc="Otorga insignias cibernéticas al cumplir tareas diarias."
                  />
                  <Switch
                    checked={config.accessibility?.eye_tracking_enabled ?? false}
                    onChange={(v) => handleAccessibilityChange("eye_tracking_enabled", v)}
                    label="Eye Tracking"
                    desc="Seguimiento ocular experimental para navegación sin manos."
                  />
                  <Switch
                    checked={config.accessibility?.micro_movement_enabled ?? false}
                    onChange={(v) => handleAccessibilityChange("micro_movement_enabled", v)}
                    label="Gestos faciales"
                    desc="Control básico del cursor mediante micro-gestos en webcam."
                  />
                  <Switch
                    checked={config.accessibility?.high_contrast_mode ?? false}
                    onChange={(v) => handleAccessibilityChange("high_contrast_mode", v)}
                    label="Alto Contraste"
                    desc="Ajusta los bordes vectoriales con mayor luminosidad."
                  />
                </div>

                <Card title="SPEECH FILTERS & FONTS">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Umbral de error de voz (VAD)">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[0.62rem] text-purple-400/40 font-mono">
                          <span>SENSITIV_VAL:</span>
                          <span className="font-semibold text-purple-400">{config.accessibility?.speech_error_threshold ?? 0.5}</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={0.9}
                          step={0.05}
                          value={config.accessibility?.speech_error_threshold ?? 0.5}
                          onChange={(e) => handleAccessibilityChange("speech_error_threshold", parseFloat(e.target.value) || 0.5)}
                          className="w-full h-1 bg-purple-950/40 rounded-full appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>
                    </InputField>

                    <InputField label="Escala global de fuentes (UI)">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[0.62rem] text-purple-400/40 font-mono">
                          <span>SCALE_RATIO:</span>
                          <span className="font-semibold text-purple-400">{config.accessibility?.font_size_scale ?? 1.0}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.8}
                          max={1.5}
                          step={0.05}
                          value={config.accessibility?.font_size_scale ?? 1.0}
                          onChange={(e) => handleAccessibilityChange("font_size_scale", parseFloat(e.target.value) || 1.0)}
                          className="w-full h-1 bg-purple-950/40 rounded-full appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>
                    </InputField>
                  </div>
                </Card>
              </div>
            )}

            {/* 4. IA & SPOTIFY */}
            {activeTab === "api_keys" && (
              <div className="space-y-5 animate-fade-in">
                <Card title="LLM SERVICE PROVIDER">
                  <InputField label="Proveedor de LLM Activo">
                    <select
                      value={config.llm_provider || "gemini"}
                      onChange={(e) => onConfigChange("llm_provider", e.target.value)}
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer transition-all font-mono"
                    >
                      <option value="gemini" className="bg-black text-purple-200">Google Gemini (Recomendado)</option>
                      <option value="openrouter" className="bg-black text-purple-200">OpenRouter Router</option>
                      <option value="minimax" className="bg-black text-purple-200">MiniMax M2.7 (Token Plan)</option>
                      <option value="ollama_cloud" className="bg-black text-purple-200">Ollama Cloud (Cloud, Free Models)</option>
                      <option value="nvidia_nim" className="bg-black text-purple-200">NVIDIA NIM (Free Tier)</option>
                      <option value="compatible_local_openai" className="bg-black text-purple-200">OpenAI API Local (Jan AI, LM Studio)</option>
                    </select>
                  </InputField>
                </Card>

                <Card title="MINIMAX LLM (M2.7 TOKEN PLAN)">
                  <SecretField
                    label="MiniMax API Key (Token Plan)"
                    value={config.minimax_api_key || ""}
                    onChange={(v) => onConfigChange("minimax_api_key", v)}
                  />
                  <InputField label="Modelo MiniMax LLM">
                    <select
                      value={config.minimax_llm_model || "MiniMax-M2.7"}
                      onChange={(e) => onConfigChange("minimax_llm_model", e.target.value)}
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer font-mono"
                    >
                      <option value="MiniMax-M2.7" className="bg-black text-purple-200">MiniMax-M2.7 (204.8K ctx, ~60 tps)</option>
                      <option value="MiniMax-M2.7-highspeed" className="bg-black text-purple-200">MiniMax-M2.7 Highspeed (~100 tps)</option>
                      <option value="MiniMax-M2.5" className="bg-black text-purple-200">MiniMax-M2.5 (204.8K ctx, ~60 tps)</option>
                      <option value="MiniMax-M2.5-highspeed" className="bg-black text-purple-200">MiniMax-M2.5 Highspeed (~100 tps)</option>
                      <option value="MiniMax-M2.1" className="bg-black text-purple-200">MiniMax-M2.1 (204.8K ctx)</option>
                      <option value="MiniMax-M2.1-highspeed" className="bg-black text-purple-200">MiniMax-M2.1 Highspeed</option>
                    </select>
                  </InputField>
                </Card>

                <Card title="OLLAMA CLOUD (cloud.ollama.com)">
                  <SecretField
                    label="Ollama Cloud API Key"
                    value={config.ollama_cloud_api_key || ""}
                    onChange={(v) => onConfigChange("ollama_cloud_api_key", v)}
                  />
                  <InputField label="Modelo Ollama Cloud">
                    <select
                      value={config.ollama_cloud_model || "nemotron-3-super:cloud"}
                      onChange={(e) => onConfigChange("ollama_cloud_model", e.target.value)}
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer font-mono"
                    >
                      <option value="nemotron-3-super:cloud" className="bg-black text-purple-200">Nemotron 3 Super (Cloud) - No sub required</option>
                      <option value="gemma4:31b-cloud" className="bg-black text-purple-200">Gemma 4 31B (Cloud) - No sub required</option>
                      <option value="llama3.2:70b-cloud" className="bg-black text-purple-200">Llama 3.2 70B (Cloud)</option>
                      <option value="qwen2.5:72b-cloud" className="bg-black text-purple-200">Qwen 2.5 72B (Cloud)</option>
                      <option value="mistral-nemo:12b-cloud" className="bg-black text-purple-200">Mistral Nemo 12B (Cloud)</option>
                    </select>
                  </InputField>
                </Card>

                <Card title="NVIDIA NIM (console.nvidia.com)">
                  <SecretField
                    label="NVIDIA NIM API Key"
                    value={config.nvidia_nim_api_key || ""}
                    onChange={(v) => onConfigChange("nvidia_nim_api_key", v)}
                  />
                  <InputField label="Modelo NVIDIA NIM">
                    <select
                      value={config.nvidia_nim_model || "meta/llama-3.1-70b-instruct"}
                      onChange={(e) => onConfigChange("nvidia_nim_model", e.target.value)}
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer font-mono"
                    >
                      <option value="meta/llama-3.1-405b-instruct" className="bg-black text-purple-200">Llama 3.1 405B Instruct</option>
                      <option value="meta/llama-3.1-70b-instruct" className="bg-black text-purple-200">Llama 3.1 70B Instruct</option>
                      <option value="meta/llama-3.1-8b-instruct" className="bg-black text-purple-200">Llama 3.1 8B Instruct</option>
                      <option value="mistralai/mixtral-8x7b-instruct-v0.1" className="bg-black text-purple-200">Mixtral 8x7B Instruct</option>
                      <option value="mistralai/mistral-7b-instruct-v0.3" className="bg-black text-purple-200">Mistral 7B Instruct v0.3</option>
                      <option value="nvidia/llama-3.1-nemotron-70b-instruct" className="bg-black text-purple-200">Nemotron 70B Instruct</option>
                      <option value="google/gemma-2-27b-instruct" className="bg-black text-purple-200">Gemma 2 27B Instruct</option>
                    </select>
                  </InputField>
                </Card>

                <Card title="CLOUD API INTEGRATIONS">
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

                <Card title="SPOTIFY MUSIC OAUTH">
                  <div className="grid grid-cols-2 gap-4">
                    <SecretField
                      label="Spotify Client ID"
                      value={config.spotify_client_id || ""}
                      onChange={(v) => onConfigChange("spotify_client_id", v)}
                    />
                    <SecretField
                      label="Spotify Client Secret"
                      value={config.spotify_client_secret || ""}
                      onChange={(v) => onConfigChange("spotify_client_secret", v)}
                    />
                  </div>
                  <InputField label="Redirect URI de Spotify (OAuth)">
                    <input
                      type="text"
                      value={config.spotify_redirect_uri || "http://127.0.0.1:8888/callback"}
                      onChange={(e) => onConfigChange("spotify_redirect_uri", e.target.value)}
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                    />
                  </InputField>
                </Card>
              </div>
            )}

            {/* 5. GEOLOCALIZACION */}
            {activeTab === "location" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="METEO POSITIONING">
                  <InputField label="Modo de Localización">
                    <select
                      value={config.location_mode || "system"}
                      onChange={(e) => onConfigChange("location_mode", e.target.value)}
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer transition-all font-mono"
                    >
                      <option value="system" className="bg-black text-purple-200">AUTOMÁTICO (IP GEOLOC)</option>
                      <option value="manual" className="bg-black text-purple-200">COORDENADAS MANUALES</option>
                    </select>
                  </InputField>

                  <div className="grid grid-cols-3 gap-4">
                    <InputField label="Ciudad">
                      <input
                        type="text"
                        value={config.location_city || ""}
                        onChange={(e) => onConfigChange("location_city", e.target.value)}
                        placeholder="Honduras"
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                      />
                    </InputField>
                    <InputField label="Latitud">
                      <input
                        type="text"
                        value={config.location_lat || ""}
                        onChange={(e) => onConfigChange("location_lat", e.target.value)}
                        placeholder="14.0"
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                      />
                    </InputField>
                    <InputField label="Longitud">
                      <input
                        type="text"
                        value={config.location_lon || ""}
                        onChange={(e) => onConfigChange("location_lon", e.target.value)}
                        placeholder="-87.0"
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                      />
                    </InputField>
                  </div>

                  <InputField label="Zona Horaria (Timezone)">
                    <input
                      type="text"
                      value={config.timezone || ""}
                      onChange={(e) => onConfigChange("timezone", e.target.value)}
                      placeholder="America/Tegucigalpa"
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                    />
                  </InputField>
                </Card>
              </div>
            )}

            {/* 6. KERNEL LLM LOCAL */}
            {activeTab === "llm_kernel" && (
              <div className="space-y-5 animate-fade-in">
                <Card title="LOCAL COMPATIBLE OPENAI (JAN AI / LM STUDIO)">
                  <InputField label="URL Base de API Local">
                    <input
                      type="text"
                      value={config.compatible_local_openai_base_url || "http://127.0.0.1:1337/v1"}
                      onChange={(e) => onConfigChange("compatible_local_openai_base_url", e.target.value)}
                      placeholder="http://127.0.0.1:1337/v1"
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                    />
                  </InputField>

                  <InputField label="Identificador de Modelo Local">
                    <input
                      type="text"
                      value={config.compatible_local_openai_model || "mistral-7b-instruct"}
                      onChange={(e) => onConfigChange("compatible_local_openai_model", e.target.value)}
                      placeholder="mistral-7b-instruct"
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                    />
                  </InputField>

                  <SecretField
                    label="API Key Local (Opcional)"
                    value={config.compatible_local_openai_api_key || ""}
                    onChange={(v) => onConfigChange("compatible_local_openai_api_key", v)}
                  />

                  <Switch
                    checked={config.compatible_local_openai_reasoning ?? false}
                    onChange={(v) => onConfigChange("compatible_local_openai_reasoning", v)}
                    label="Habilitar Modo Razonamiento"
                    desc="Ajusta el procesamiento de respuestas para soportar razonamientos secuenciales profundos."
                  />
                </Card>

                <Card title="AUDIO DEVICE CHANNELS">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Dispositivo de Entrada (Mic)">
                      <select
                        value={config.mic_device || "auto"}
                        onChange={(e) => onConfigChange("mic_device", e.target.value)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer font-mono"
                      >
                        <option value="auto" className="bg-black text-purple-200">Autodetectar Micrófono</option>
                        {audioDevices.microphones.map((dev) => (
                          <option key={dev.index} value={dev.name} className="bg-black text-purple-200">
                            {dev.name} ({dev.channels_in} in)
                          </option>
                        ))}
                      </select>
                    </InputField>

                    <InputField label="Dispositivo de Salida (Speaker)">
                      <select
                        value={config.speaker_device || "auto"}
                        onChange={(e) => onConfigChange("speaker_device", e.target.value)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-black/60 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer font-mono"
                      >
                        <option value="auto" className="bg-black text-purple-200">Autodetectar Altavoz</option>
                        {audioDevices.speakers.map((dev) => (
                          <option key={dev.index} value={dev.name} className="bg-black text-purple-200">
                            {dev.name} ({dev.channels_out} out)
                          </option>
                        ))}
                      </select>
                    </InputField>
                  </div>
                </Card>
              </div>
            )}

            {/* 7. REGISTRO DE APLICACIONES */}
            {activeTab === "registry" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="SYS_REGISTRY // LAUNCH_HOOKS">
                  <div className="flex gap-3 items-end">
                    <InputField label="Alias del Comando">
                      <input
                        type="text"
                        placeholder="por ej., steam, spotify"
                        value={newAppAlias}
                        onChange={(e) => setNewAppAlias(e.target.value)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                      />
                    </InputField>

                    <InputField label="Tipo">
                      <select
                        value={newAppType}
                        onChange={(e) => setNewAppType(e.target.value as any)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-black px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer font-mono"
                      >
                        <option value="exe" className="bg-black text-purple-200">Ejecutable (EXE/Path)</option>
                        <option value="appid" className="bg-black text-purple-200">App ID (Windows Store)</option>
                      </select>
                    </InputField>

                    <button
                      type="button"
                      onClick={handleAddApp}
                      className="h-9 w-9 shrink-0 flex items-center justify-center border border-purple-500/30 rounded-lg hover:bg-purple-500/10 text-purple-400 hover:text-purple-200 cursor-pointer transition-all duration-300"
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <InputField label="Ruta completa o App ID">
                    <input
                      type="text"
                      placeholder={newAppType === "exe" ? "C:\\Archivos de Programa\\...\\app.exe" : "spotify"}
                      value={newAppPath}
                      onChange={(e) => setNewAppPath(e.target.value)}
                      className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                    />
                  </InputField>

                  <div className="border border-purple-500/10 rounded-xl bg-black/60 p-4 max-h-[220px] overflow-y-auto mt-4">
                    <table className="w-full text-xs font-mono text-purple-300/80">
                      <thead>
                        <tr className="border-b border-purple-500/10 pb-2 text-[0.62rem] text-purple-400/40">
                          <th className="text-left py-1.5 uppercase font-bold">Alias</th>
                          <th className="text-left py-1.5 uppercase font-bold">Tipo</th>
                          <th className="text-left py-1.5 uppercase font-bold">Destino</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(config.app_registry?.apps || {}).map(([alias, val]) => (
                          <tr key={alias} className="border-b border-purple-500/5 hover:bg-purple-500/5 transition-all">
                            <td className="py-2 text-purple-200 font-semibold">{alias}</td>
                            <td className="py-2 uppercase text-[0.58rem]">{val.type}</td>
                            <td className="py-2 truncate max-w-xs" title={val.path || val.id}>{val.path || val.id}</td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveApp(alias)}
                                className="text-red-500/50 hover:text-red-400 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {Object.keys(config.app_registry?.apps || {}).length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-purple-500/30 text-[0.68rem] uppercase font-mono">
                              No hay aplicaciones registradas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* 8. PERFIL */}
            {activeTab === "profile" && (
              <div className="space-y-4 animate-fade-in">
                <Card title="OPERATOR METADATA">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Nombre del Operador">
                      <input
                        type="text"
                        value={config.user_profile?.name || "Usuario"}
                        onChange={(e) => handleUserProfileChange("name", e.target.value)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-purple-950/5 px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 transition-all font-mono select-text"
                      />
                    </InputField>
                    <InputField label="Idioma Preferido">
                      <select
                        value={config.user_profile?.language || "es"}
                        onChange={(e) => handleUserProfileChange("language", e.target.value)}
                        className="w-full h-9 rounded-lg border border-purple-500/10 bg-black px-3 text-xs text-purple-200 outline-none focus:border-purple-500/35 cursor-pointer font-mono"
                      >
                        <option value="es" className="bg-black text-purple-200">Español (ES)</option>
                        <option value="en" className="bg-black text-purple-200">English (EN)</option>
                      </select>
                    </InputField>
                  </div>
                </Card>
              </div>
            )}

            {/* 9. CONSOLA DE PROCESO */}
            {activeTab === "system" && (
              <div className="space-y-5 animate-fade-in">
                <Card title="KERNEL DE MIN DEPURACIÓN">
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono text-purple-300/80">
                    <div className="p-3 rounded-lg border border-purple-500/5 bg-purple-950/5">
                      <div className="text-[0.62rem] text-purple-400/40 uppercase mb-1.5 font-bold">Estado Uptime</div>
                      {agentStatus ? (
                        <div className="text-sm font-semibold text-purple-200">
                          {Math.floor(agentStatus.uptime_seconds / 60)}m {agentStatus.uptime_seconds % 60}s Activo
                        </div>
                      ) : (
                        <div className="text-sm text-red-500/80 uppercase font-semibold">Fuera de Línea</div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg border border-purple-500/5 bg-purple-950/5">
                      <div className="text-[0.62rem] text-purple-400/40 uppercase mb-1.5 font-bold">Python Kernel</div>
                      <div className="text-sm text-purple-200">
                        {agentStatus ? agentStatus.python_version.split(" ")[0] : "Desconocido"}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="LIFECYCLE MANAGEMENT">
                  <p className="text-[0.62rem] text-purple-400/40 leading-relaxed font-sans -mt-1.5 mb-2">
                    Comandos del sistema operativo para administrar el proceso de ejecución de MIN.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Boot Button */}
                    <button
                      type="button"
                      disabled={starting || !!agentStatus}
                      onClick={handleStartAgent}
                      className="h-10 rounded border border-purple-500/35 bg-purple-500/5 hover:bg-purple-500 hover:text-black font-mono text-[0.68rem] tracking-widest text-purple-400 hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-300"
                    >
                      <Play className="h-4 w-4" />
                      ARRANCAR CORE
                    </button>

                    {/* Restart Button */}
                    <button
                      type="button"
                      disabled={!agentStatus}
                      onClick={onRestartAgent}
                      className="h-10 rounded border border-amber-500/35 bg-amber-500/5 hover:bg-amber-500 hover:text-black font-mono text-[0.68rem] tracking-widest text-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                      REINICIAR CORE
                    </button>

                    {/* Kill Button */}
                    <button
                      type="button"
                      disabled={!agentStatus}
                      onClick={onKillAgent}
                      className="h-10 rounded border border-red-500/35 bg-red-500/5 hover:bg-red-500 hover:text-black font-mono text-[0.68rem] tracking-widest text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-300"
                    >
                      <Skull className="h-4 w-4" />
                      MATAR PROCESO
                    </button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <footer className="px-8 py-4 border-t border-purple-500/10 flex justify-between items-center bg-purple-950/5 shrink-0 select-none">
            <span className="text-[0.58rem] font-mono text-purple-400/40 uppercase tracking-widest">
              [SYSTEM_CONFIG_MASTER_OK]
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 rounded border border-purple-500/10 bg-black/40 text-xs text-purple-400 hover:bg-purple-500/5 cursor-pointer font-mono tracking-wider transition-all"
              >
                CERRAR
              </button>
              <button
                type="button"
                onClick={onSave}
                className="h-9 px-5 rounded bg-purple-500 text-black font-semibold text-xs hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] hover:bg-purple-400 cursor-pointer font-mono tracking-wider flex items-center gap-2 transition-all"
              >
                <Save className="h-4 w-4" />
                GUARDAR
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
