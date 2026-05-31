// ── MIN TypeScript Interfaces ────────────────────────────────────────────────

export type AssistantState = "LISTENING" | "THINKING" | "SPEAKING" | "MUTED" | "SUSPENDED" | "OFFLINE";

export interface WeatherData {
  place: string;
  desc: string;
  emoji: string;
  weather_code: number | null;
  is_day: number | null;
  temp: number | null;
  feel: number | null;
  humidity: number | null;
  precip: number | null;
  wind: number | null;
  wind_dir: string;
  local_time: string;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  desc: string;
  emoji: string;
  min: number | null;
  max: number | null;
  code: number | null;
}

export interface MediaInfo {
  app: string;
  title: string;
  artist: string;
  status?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
  due_date?: string;
  subtasks?: { title: string; status: string }[];
  created_at?: string;
  completed_at?: string | null;
}

export interface FavoriteItem {
  title: string;
  url: string;
}

export interface MinConfig {
  min_voice: string;
  gemini_api_key: string;
  openrouter_api_key: string;
  minimax_api_key: string;
  minimax_llm_model: string;
  minimax_music_model: string;
  ollama_cloud_api_key: string;
  ollama_cloud_base_url: string;
  ollama_cloud_model: string;
  nvidia_nim_api_key: string;
  nvidia_nim_base_url: string;
  nvidia_nim_model: string;
  spotify_client_id: string;
  spotify_client_secret: string;
  spotify_redirect_uri: string;
  gpu_acceleration: boolean;
  mic_device: string;
  speaker_device: string;
  live_model: string;
  vision_model: string;
  openrouter_default_model: string;
  browser_preference: string;
  browser_paths: Record<string, string>;
  location_mode: string;
  location_city: string;
  location_lat: string;
  location_lon: string;
  timezone: string;
  language: string;
  min_theme: string;
  ui_mode: string;
  camera_enabled?: boolean;
  camera_index?: number;
  max_memory_mb?: number;
  llm_provider?: string;
  compatible_local_openai_base_url?: string;
  compatible_local_openai_model?: string;
  compatible_local_openai_api_key?: string;
  compatible_local_openai_reasoning?: boolean;
  vision_guardian?: {
    enabled: boolean;
    interval: number;
  };
  accessibility?: {
    task_simplification_enabled: boolean;
    emotional_regulation_enabled: boolean;
    routine_gamification_enabled: boolean;
    eye_tracking_enabled: boolean;
    micro_movement_enabled: boolean;
    visual_feedback_enabled: boolean;
    high_contrast_mode: boolean;
    auto_learn_routines: boolean;
    speech_error_threshold: number;
    font_size_scale: number;
  };
  user_profile?: {
    name: string;
    language: string;
    preferences?: Record<string, unknown>;
    habits?: Record<string, number>;
    frequent_actions?: Record<string, number>;
    created?: string;
    last_updated?: string;
  };
  app_registry?: {
    apps: Record<string, { type: "exe" | "appid"; path?: string; id?: string }>;
  };
}

export interface AudioDevice {
  index: number;
  name: string;
  channels_in: number;
  channels_out: number;
}

export interface ModelEntry {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
}

export interface AgentStatus {
  pid: number;
  uptime_seconds: number;
  memory_mb: number;
  python_version: string;
}

export interface WSMessage {
  type: string;
  value?: string;
  data?: unknown;
  state?: AssistantState;
  level?: number;
  app?: string;
  title?: string;
  artist?: string;
  action?: string;
  config?: Partial<MinConfig>;
}

export type WidgetType = "clock" | "weather" | "music" | "todos" | "favorites" | null;

/** Voces disponibles para MIN: [género, descripción] */
export const MIN_VOICES: Record<string, [string, string]> = {
  Aoede: ["Femenina", "Cálida y sofisticada — ideal para asistente IA"],
  Kore: ["Femenina", "Suave y precisa"],
  Leda: ["Femenina", "Natural y fluida"],
  Zephyr: ["Femenina", "Dinámica y expresiva"],
  Charon: ["Masculina", "Profunda y seria — voz original de MIN"],
  Puck: ["Masculina", "Ágil y versátil"],
  Fenrir: ["Masculina", "Grave y autoritaria"],
  Orus: ["Masculina", "Clásica y equilibrada"],
};
