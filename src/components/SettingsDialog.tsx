import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
} from "./ui/select";
import { cn } from "../lib/utils";
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
  EyeOff,
  Accessibility,
  Camera,
  Grid,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
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
  { id: "assistant", label: "Asistente", icon: User, desc: "Personaliza la voz, navegador y cámara de MIN." },
  { id: "guardian", label: "Guardián de Visión", icon: Eye, desc: "Configura la protección ocular y análisis de pantalla." },
  { id: "accessibility", label: "Accesibilidad", icon: Accessibility, desc: "Ajusta las opciones de soporte cognitivo y motor." },
  { id: "api_keys", label: "API Keys & Spotify", icon: Key, desc: "Establece tus credenciales de servicios e IA." },
  { id: "location", label: "Ubicación & Hora", icon: MapPin, desc: "Configura geolocalización, clima y zona horaria." },
  { id: "advanced", label: "Hardware & Modelos", icon: Cpu, desc: "Parámetros avanzados de modelos y hardware." },
  { id: "registry", label: "Registro de Apps", icon: Grid, desc: "Gestiona los alias y rutas de aplicaciones del sistema." },
  { id: "profile", label: "Perfil", icon: User, desc: "Detalles personalizados de tu perfil de usuario." },
  { id: "system", label: "Sistema", icon: Monitor, desc: "Monitorea la instancia de Python del asistente." },
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
  const [starting, setStarting] = useState(false);

  const handleStartAgent = async () => {
    setStarting(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("start_agent");
      setTimeout(() => {
        onRequestStatus();
        setStarting(false);
      }, 2000);
    } catch (err) {
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

  // Nested property handlers
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

  const handleAppRegistryChange = (alias: string, field: string, val: string) => {
    const reg = config.app_registry || { apps: {} };
    const apps = { ...reg.apps };
    if (apps[alias]) {
      apps[alias] = { ...apps[alias], [field]: val } as any;
      onConfigChange("app_registry", { ...reg, apps });
    }
  };

  const handleAddApp = () => {
    const alias = newAppAlias.trim().toLowerCase();
    if (!alias) return;
    const reg = config.app_registry || { apps: {} };
    const apps = { ...reg.apps };
    if (!apps[alias]) {
      apps[alias] = { type: "exe", path: "" };
      onConfigChange("app_registry", { ...reg, apps });
      setNewAppAlias("");
    }
  };

  const handleRemoveApp = (alias: string) => {
    const reg = config.app_registry || { apps: {} };
    const apps = { ...reg.apps };
    delete apps[alias];
    onConfigChange("app_registry", { ...reg, apps });
  };

  // Helper custom switch component
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
    <div className="flex items-start justify-between p-3 rounded-sm bg-zinc-900/30 border border-zinc-800/40 hover:border-purple-500/20 transition-all">
      <div className="space-y-0.5 pr-4">
        <label className="text-xs font-semibold text-gray-200">{label}</label>
        {desc && <p className="text-[0.7rem] text-gray-400">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5",
          checked ? "bg-purple-600 shadow-md shadow-purple-500/20" : "bg-zinc-800"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col p-0 border border-purple-500/20 bg-zinc-950/98 backdrop-blur-2xl rounded-sm shadow-2xl shadow-purple-500/5">
        <div className="flex-1 overflow-hidden flex">
          {/* ── Panel Izquierdo: Sidebar ───────────────────────────────────── */}
          <div className="w-64 border-r border-purple-500/10 p-5 flex flex-col justify-between shrink-0 bg-black/40">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5" /> MIN Config
                </h3>
                <p className="text-[0.65rem] text-gray-500 mt-1">Ajusta los parámetros del asistente en tiempo real.</p>
              </div>

              <div className="space-y-1">
                {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium transition-all text-left group cursor-pointer",
                      activeTab === id
                        ? "text-purple-300 bg-purple-500/15 border-l-2 border-purple-500 shadow-md shadow-purple-500/5"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                    <ChevronRight className={cn("h-3 w-3 opacity-0 transition-opacity", activeTab === id && "opacity-100 text-purple-400")} />
                  </button>
                ))}
              </div>
            </div>

            {agentStatus && (
              <div className="rounded-sm border border-purple-500/10 bg-purple-950/5 p-3 space-y-2">
                <div className="flex items-center justify-between text-[0.65rem] text-gray-500 font-bold uppercase tracking-wider">
                  <span>MIN Live Status</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[0.65rem] text-gray-400">
                  <div>RAM: <span className="font-mono text-gray-200">{agentStatus.memory_mb} MB</span></div>
                  <div>PID: <span className="font-mono text-gray-200">{agentStatus.pid}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* ── Panel Derecho: Contenido ───────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
            <div className="p-6 border-b border-purple-500/10 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  {TAB_ITEMS.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {TAB_ITEMS.find((t) => t.id === activeTab)?.desc}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ── ASISTENTE ──────────────────────────────────────────────── */}
              {activeTab === "assistant" && (
                <div className="space-y-5">
                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-purple-400">Personalización de Voz y Navegador</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingsField label="Voz del asistente (TTS)">
                        <Select
                          value={config.min_voice || "Aoede"}
                          onValueChange={(v: string) => onConfigChange("min_voice", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar voz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Voces Femeninas</SelectLabel>
                              {Object.entries(MIN_VOICES)
                                .filter(([, meta]) => meta[0] === "Femenina")
                                .map(([name, meta]) => (
                                  <SelectItem key={name} value={name}>
                                    {name} — {meta[1]}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Voces Masculinas</SelectLabel>
                              {Object.entries(MIN_VOICES)
                                .filter(([, meta]) => meta[0] === "Masculina")
                                .map(([name, meta]) => (
                                  <SelectItem key={name} value={name}>
                                    {name} — {meta[1]}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </SettingsField>

                      <SettingsField label="Navegador de preferencia">
                        <Select
                          value={config.browser_preference || "auto"}
                          onValueChange={(v: string) => onConfigChange("browser_preference", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Automático" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Autodetectar navegador del sistema</SelectItem>
                            <SelectItem value="chrome">Google Chrome</SelectItem>
                            <SelectItem value="brave">Brave Browser</SelectItem>
                            <SelectItem value="edge">Microsoft Edge</SelectItem>
                            <SelectItem value="firefox">Mozilla Firefox</SelectItem>
                            <SelectItem value="opera">Opera</SelectItem>
                            <SelectItem value="opera_gx">Opera GX</SelectItem>
                          </SelectContent>
                        </Select>
                      </SettingsField>
                    </div>
                  </div>

                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-purple-400 flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" /> Cámara Web</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mt-1">
                        <Switch
                          checked={config.camera_enabled ?? true}
                          onChange={(v) => onConfigChange("camera_enabled", v)}
                          label="Activar Cámara"
                          desc="Permite a MIN usar la cámara para herramientas de visión y captura."
                        />
                      </div>
                      <SettingsField label="Índice de la Cámara Web">
                        <Input
                          type="number"
                          min={0}
                          max={9}
                          value={config.camera_index ?? 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("camera_index", parseInt(e.target.value) || 0)}
                          placeholder="0 (Cámara integrada/primaria)"
                        />
                      </SettingsField>
                    </div>
                  </div>

                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-purple-400">Estabilidad y Rendimiento</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingsField label="Límite de memoria RAM del Backend (MB)">
                        <Input
                          type="number"
                          min={150}
                          max={2048}
                          value={config.max_memory_mb ?? 500}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("max_memory_mb", parseInt(e.target.value) || 500)}
                          placeholder="500"
                        />
                      </SettingsField>
                    </div>
                  </div>
                </div>
              )}

              {/* ── GUARDIÁN DE VISIÓN ────────────────────────────────────────── */}
              {activeTab === "guardian" && (
                <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-5">
                  <Switch
                    checked={config.vision_guardian?.enabled ?? false}
                    onChange={(v) => handleVisionGuardianChange("enabled", v)}
                    label="Habilitar Guardián de Visión"
                    desc="Activa el análisis pasivo de pantalla en segundo plano para alertarte si necesitas soporte."
                  />

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>Intervalo de escaneo de pantalla: <span className="text-purple-400 font-mono font-semibold">{config.vision_guardian?.interval ?? 120} segundos</span></span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min={30}
                        max={600}
                        step={10}
                        value={config.vision_guardian?.interval ?? 120}
                        onChange={(e) => handleVisionGuardianChange("interval", parseInt(e.target.value))}
                        className="flex-1 h-1 bg-zinc-800 rounded-sm appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-sm bg-purple-950/10 border border-purple-500/10 text-[0.7rem] text-purple-300 leading-relaxed">
                    💡 **¿Cómo funciona?** El Guardián de Visión ejecuta capturas de pantalla silenciosas en el intervalo configurado y utiliza Gemini Vision para procesar la información en vivo. Si detecta anomalías, problemas o contenido útil, inyecta comentarios de voz o notificaciones en tu chat. No captura imágenes si estás reproduciendo audio o el asistente está hablando.
                  </div>
                </div>
              )}

              {/* ── ACCESIBILIDAD ────────────────────────────────────────────── */}
              {activeTab === "accessibility" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Switch
                      checked={config.accessibility?.task_simplification_enabled ?? true}
                      onChange={(v) => handleAccessibilityChange("task_simplification_enabled", v)}
                      label="Simplificación de Tareas"
                      desc="Desglosa comandos complejos en pasos ordenados."
                    />
                    <Switch
                      checked={config.accessibility?.emotional_regulation_enabled ?? true}
                      onChange={(v) => handleAccessibilityChange("emotional_regulation_enabled", v)}
                      label="Regulación Emocional"
                      desc="Adapta el tono de voz de MIN para reducir el estrés."
                    />
                    <Switch
                      checked={config.accessibility?.routine_gamification_enabled ?? true}
                      onChange={(v) => handleAccessibilityChange("routine_gamification_enabled", v)}
                      label="Gamificación de Rutinas"
                      desc="Añade logros y estímulos divertidos al completar tareas."
                    />
                    <Switch
                      checked={config.accessibility?.eye_tracking_enabled ?? false}
                      onChange={(v) => handleAccessibilityChange("eye_tracking_enabled", v)}
                      label="Seguimiento Ocular"
                      desc="Soporte para interacciones mediante hardware de mirada."
                    />
                    <Switch
                      checked={config.accessibility?.micro_movement_enabled ?? false}
                      onChange={(v) => handleAccessibilityChange("micro_movement_enabled", v)}
                      label="Micro Movimientos"
                      desc="Permite controlar el puntero mediante gestos faciales."
                    />
                    <Switch
                      checked={config.accessibility?.visual_feedback_enabled ?? true}
                      onChange={(v) => handleAccessibilityChange("visual_feedback_enabled", v)}
                      label="Feedback Visual"
                      desc="Muestra guías y flashes adicionales durante acciones."
                    />
                    <Switch
                      checked={config.accessibility?.high_contrast_mode ?? false}
                      onChange={(v) => handleAccessibilityChange("high_contrast_mode", v)}
                      label="Modo Alto Contraste"
                      desc="Ajusta el color del frontend para mejorar la visibilidad."
                    />
                    <Switch
                      checked={config.accessibility?.auto_learn_routines ?? true}
                      onChange={(v) => handleAccessibilityChange("auto_learn_routines", v)}
                      label="Auto-aprendizaje de Rutinas"
                      desc="Sugerencias inteligentes basadas en tus hábitos diarios."
                    />
                  </div>

                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-purple-400">Umbrales & Escala</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingsField label="Umbral de error de habla (Filtro de ruido)">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[0.65rem] text-gray-400">
                            <span>Umbral: <span className="font-semibold text-purple-400">{config.accessibility?.speech_error_threshold ?? 0.5}</span></span>
                          </div>
                          <input
                            type="range"
                            min={0.1}
                            max={0.9}
                            step={0.05}
                            value={config.accessibility?.speech_error_threshold ?? 0.5}
                            onChange={(e) => handleAccessibilityChange("speech_error_threshold", parseFloat(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-sm appearance-none cursor-pointer accent-purple-500"
                          />
                        </div>
                      </SettingsField>

                      <SettingsField label="Escala del tamaño de fuente">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[0.65rem] text-gray-400">
                            <span>Escala: <span className="font-semibold text-purple-400">{config.accessibility?.font_size_scale ?? 1.0}x</span></span>
                          </div>
                          <input
                            type="range"
                            min={0.8}
                            max={1.5}
                            step={0.05}
                            value={config.accessibility?.font_size_scale ?? 1.0}
                            onChange={(e) => handleAccessibilityChange("font_size_scale", parseFloat(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-sm appearance-none cursor-pointer accent-purple-500"
                          />
                        </div>
                      </SettingsField>
                    </div>
                  </div>
                </div>
              )}

              {/* ── API KEYS ───────────────────────────────────────────────── */}
              {activeTab === "api_keys" && (
                <div className="space-y-4">
                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-purple-400 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Claves de IA</h4>
                    <SecretField label="Gemini API Key" value={config.gemini_api_key || ""} onChange={(v: string) => onConfigChange("gemini_api_key", v)} />
                    <SecretField label="OpenRouter API Key" value={config.openrouter_api_key || ""} onChange={(v: string) => onConfigChange("openrouter_api_key", v)} />
                  </div>

                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-purple-400">Spotify Developer Credenciales</h4>
                    <SecretField label="Spotify Client ID" value={config.spotify_client_id || ""} onChange={(v: string) => onConfigChange("spotify_client_id", v)} />
                    <SecretField label="Spotify Client Secret" value={config.spotify_client_secret || ""} onChange={(v: string) => onConfigChange("spotify_client_secret", v)} />
                    <SettingsField label="Spotify Redirect URI">
                      <Input value={config.spotify_redirect_uri || "http://127.0.0.1:8888/callback"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("spotify_redirect_uri", e.target.value)} />
                    </SettingsField>
                  </div>
                </div>
              )}

              {/* ── UBICACIÓN ──────────────────────────────────────────────── */}
              {activeTab === "location" && (
                <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                  <SettingsField label="Modo de ubicación">
                    <Select value={config.location_mode || "system"} onValueChange={(v: string) => onConfigChange("location_mode", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">Automatico (IP Geolocation)</SelectItem>
                        <SelectItem value="manual">Manual (Ingresar ciudad/coordenadas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>

                  <div className="grid grid-cols-3 gap-4">
                    <SettingsField label="Ciudad">
                      <Input value={config.location_city || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("location_city", e.target.value)} placeholder="Tegucigalpa" />
                    </SettingsField>
                    <SettingsField label="Latitud">
                      <Input value={config.location_lat || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("location_lat", e.target.value)} placeholder="14.0723" />
                    </SettingsField>
                    <SettingsField label="Longitud">
                      <Input value={config.location_lon || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("location_lon", e.target.value)} placeholder="-87.1921" />
                    </SettingsField>
                  </div>

                  <SettingsField label="Zona Horaria (Timezone)">
                    <Input value={config.timezone || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("timezone", e.target.value)} placeholder="America/Tegucigalpa" />
                  </SettingsField>
                </div>
              )}

              {/* ── AVANZADO ───────────────────────────────────────────────── */}
              {activeTab === "advanced" && (
                <div className="space-y-4">
                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-purple-400">Dispositivos de Audio</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingsField label="Micrófono Activo">
                        <Select value={config.mic_device?.toString() || "default"} onValueChange={(v: string) => onConfigChange("mic_device", v === "default" ? 0 : parseInt(v))}>
                          <SelectTrigger><SelectValue placeholder="Predeterminado del sistema" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Predeterminado del sistema</SelectItem>
                            {audioDevices.microphones.map((d) => (
                              <SelectItem key={d.index} value={d.index.toString()}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </SettingsField>

                      <SettingsField label="Altavoz / Dispositivo de salida">
                        <Select value={config.speaker_device || "default"} onValueChange={(v: string) => onConfigChange("speaker_device", v === "default" ? "" : v)}>
                          <SelectTrigger><SelectValue placeholder="Predeterminado del sistema" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Predeterminado del sistema</SelectItem>
                            {audioDevices.speakers.map((d) => (
                              <SelectItem key={d.index} value={d.index.toString()}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </SettingsField>
                    </div>
                  </div>

                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                    <h4 className="text-xs font-semibold text-purple-400">Proveedor de Lenguaje (LLM Provider)</h4>
                    <div className="space-y-4">
                      <SettingsField label="Proveedor de LLM Activo">
                        <Select
                          value={config.llm_provider || "gemini"}
                          onValueChange={(v: string) => onConfigChange("llm_provider", v)}
                        >
                          <SelectTrigger className="bg-zinc-950/60 border-zinc-800">
                            <SelectValue placeholder="Seleccionar proveedor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gemini">Google Gemini Live (Nube)</SelectItem>
                            <SelectItem value="local_openai">Local compatible con OpenAI (Jan AI / LM Studio / Ollama)</SelectItem>
                          </SelectContent>
                        </Select>
                      </SettingsField>

                      {config.llm_provider === "local_openai" ? (
                        <div className="space-y-4 border-t border-zinc-800/60 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <SettingsField label="Base URL de la API Local">
                              <Input
                                value={config.local_openai_base_url || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("local_openai_base_url", e.target.value)}
                                placeholder="http://127.0.0.1:1337/v1"
                              />
                            </SettingsField>
                            <SettingsField label="Nombre del Modelo Local">
                              <Input
                                value={config.local_openai_model || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange("local_openai_model", e.target.value)}
                                placeholder="mistral-7b-instruct"
                              />
                            </SettingsField>
                          </div>
                          
                          <SecretField
                            label="API Key Local (Opcional)"
                            value={config.local_openai_api_key || ""}
                            onChange={(v: string) => onConfigChange("local_openai_api_key", v)}
                          />

                          <Switch
                            checked={config.local_openai_reasoning || false}
                            onChange={(v) => onConfigChange("local_openai_reasoning", v)}
                            label="Modo de Razonamiento (Pensamiento)"
                            desc="Pide al modelo local pensar paso a paso de forma lógica y razonada antes de contestar."
                          />
                        </div>
                      ) : (
                        <div className="space-y-3 border-t border-zinc-800/60 pt-4">
                          <SettingsField label="Modelo de voz (Gemini Live)">
                            <ModelSelect value={config.live_model || ""} onChange={(v: string) => onConfigChange("live_model", v)} models={modelsList} placeholder="models/gemini-2.0-flash-live-001" />
                          </SettingsField>
                          <SettingsField label="Modelo de visión">
                            <ModelSelect value={config.vision_model || ""} onChange={(v: string) => onConfigChange("vision_model", v)} models={modelsList} placeholder="models/gemini-2.0-flash" />
                          </SettingsField>
                          <SettingsField label="Modelo OpenRouter predeterminado">
                            <ModelSelect value={config.openrouter_default_model || ""} onChange={(v: string) => onConfigChange("openrouter_default_model", v)} models={modelsList} placeholder="google/gemini-2.5-flash" />
                          </SettingsField>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4">
                    <Switch
                      checked={config.gpu_acceleration ? true : false}
                      onChange={(v) => onConfigChange("gpu_acceleration", v)}
                      label="Aceleración GPU (WebGL & ML)"
                      desc="Usa el chip de gráficos del equipo para renderizar la esfera (Orb) y operaciones matemáticas en la UI."
                    />
                  </div>
                </div>
              )}

              {/* ── REGISTRO DE APPS ────────────────────────────────────────── */}
              {activeTab === "registry" && (
                <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="nuevo_alias (ej. chrome, spotify)"
                      value={newAppAlias}
                      onChange={(e) => setNewAppAlias(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddApp} size="sm"><Plus className="h-4 w-4 mr-1" />Añadir Alias</Button>
                  </div>

                  <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                    {config.app_registry?.apps && Object.keys(config.app_registry.apps).length > 0 ? (
                      Object.entries(config.app_registry.apps).map(([alias, val]) => (
                        <div key={alias} className="flex gap-2 items-center p-3 rounded-sm bg-zinc-950/60 border border-zinc-800/60">
                          <span className="w-24 text-xs font-semibold text-purple-400 truncate">{alias}</span>
                          <Select
                            value={val.type}
                            onValueChange={(t: "exe" | "appid") => handleAppRegistryChange(alias, "type", t)}
                          >
                            <SelectTrigger className="w-28 text-xs h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exe">Exec/File</SelectItem>
                              <SelectItem value="appid">AppID</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder={val.type === "exe" ? "C:\\Ruta\\a\\app.exe" : "PackageName!AppID"}
                            value={val.type === "exe" ? (val.path || "") : (val.id || "")}
                            onChange={(e) => handleAppRegistryChange(alias, val.type === "exe" ? "path" : "id", e.target.value)}
                            className="flex-1 text-xs h-8"
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveApp(alias)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-gray-500 py-6">No hay aplicaciones registradas.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── PERFIL ─────────────────────────────────────────────────── */}
              {activeTab === "profile" && (
                <div className="rounded-sm bg-zinc-900/20 border border-zinc-800/40 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <SettingsField label="Nombre del Usuario">
                      <Input
                        value={config.user_profile?.name || ""}
                        onChange={(e) => handleUserProfileChange("name", e.target.value)}
                        placeholder="Usuario"
                      />
                    </SettingsField>

                    <SettingsField label="Idioma del perfil">
                      <Select
                        value={config.user_profile?.language || "es"}
                        onValueChange={(v) => handleUserProfileChange("language", v)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español (es)</SelectItem>
                          <SelectItem value="en">Inglés (en)</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingsField>
                  </div>

                  {config.user_profile?.created && (
                    <p className="text-[0.65rem] text-gray-500">
                      Perfil creado el: <span className="font-mono">{new Date(config.user_profile.created).toLocaleString()}</span>
                    </p>
                  )}
                </div>
              )}

              {/* ── SISTEMA ────────────────────────────────────────────────── */}
              {activeTab === "system" && (
                <div className="space-y-4">
                  {agentStatus ? (
                    <div className="rounded-sm border border-purple-500/15 bg-purple-950/5 p-4 space-y-3">
                      <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Estado de la Instancia de MIN</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Proceso (PID)</span>
                          <p className="text-gray-200 font-mono text-sm mt-0.5">{agentStatus.pid}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Consumo de Memoria</span>
                          <p className="text-gray-200 font-mono text-sm mt-0.5">{agentStatus.memory_mb} MB</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tiempo Activo (Uptime)</span>
                          <p className="text-gray-200 font-mono text-sm mt-0.5">{Math.floor(agentStatus.uptime_seconds / 60)} min {agentStatus.uptime_seconds % 60} seg</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Versión de Python</span>
                          <p className="text-gray-200 font-mono text-[0.7rem] truncate mt-0.5" title={agentStatus.python_version}>
                            {agentStatus.python_version}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-sm border border-red-500/10 bg-red-500/5 p-4 text-center text-xs text-red-400">
                      No se pudo obtener el estado de la instancia (el backend de Python esta apagado?).
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={onRequestStatus} className="flex-1 py-5 border-zinc-800 hover:bg-zinc-900 cursor-pointer">
                      <RefreshCw className="h-4 w-4 mr-2 text-purple-400 animate-spin-slow" /> Verificar Estado
                    </Button>
                    {!agentStatus ? (
                      <Button
                        onClick={handleStartAgent}
                        disabled={starting}
                        className="flex-1 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-500/20 cursor-pointer"
                      >
                        <Power className={cn("h-4 w-4 mr-2 text-white", starting && "animate-spin")} />
                        {starting ? "Iniciando..." : "Iniciar Asistente (Start)"}
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={onRestartAgent} className="flex-1 py-5 border-zinc-800 hover:bg-purple-950/20 hover:text-purple-300 cursor-pointer">
                          <Power className="h-4 w-4 mr-2 text-purple-400" /> Reiniciar Instancia
                        </Button>
                        <Button variant="destructive" onClick={onKillAgent} className="py-5 px-6 cursor-pointer">
                          <Skull className="h-4 w-4 mr-2" /> Forzar Cierre (Kill)
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-purple-500/10 flex justify-end gap-2 bg-black/30">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-800 hover:bg-zinc-900 cursor-pointer">
                Cancelar
              </Button>
              <Button
                onClick={onSave}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 text-white font-semibold cursor-pointer px-6"
              >
                <Save className="h-4 w-4 mr-2" /> Guardar Ajustes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Helpers del Formulario ─────────────────────────────────────────────────── */

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[0.7rem] font-bold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function SecretField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <SettingsField label={label}>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder="••••••••••••••••••••••••••••••••"
          className="pr-10 bg-zinc-950/60 border-zinc-800 focus-visible:ring-purple-500/50"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </SettingsField>
  );
}

function ModelSelect({
  value,
  onChange,
  models,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  models: { gemini: ModelEntry[]; openrouter: ModelEntry[] };
  placeholder: string;
}) {
  const [manualMode, setManualMode] = useState(false);

  if (manualMode) {
    return (
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-zinc-950/60 border-zinc-800"
        />
        <Button variant="ghost" size="sm" onClick={() => setManualMode(false)} className="cursor-pointer">
          Lista
        </Button>
      </div>
    );
  }

  const hasModels = models.gemini.length > 0 || models.openrouter.length > 0;

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="bg-zinc-950/60 border-zinc-800">
        <SelectValue placeholder={hasModels ? "Seleccionar modelo" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {models.gemini.length > 0 && (
          <SelectGroup>
            <SelectLabel>Google Gemini</SelectLabel>
            {models.gemini
              .filter((m) => m.name?.toLowerCase().includes("gemini"))
              .slice(0, 20)
              .map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
          </SelectGroup>
        )}
        {models.openrouter.length > 0 && (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>OpenRouter</SelectLabel>
              {models.openrouter.slice(0, 30).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}
        <SelectSeparator />
        <button
          onClick={() => setManualMode(true)}
          className="w-full text-left px-2 py-1.5 text-xs text-purple-400 hover:bg-purple-500/10 rounded cursor-pointer font-medium"
        >
          Ingresar modelo manualmente...
        </button>
      </SelectContent>
    </Select>
  );
}
