import { useState, useEffect, useCallback } from "react";

// Type definitions for config files
export interface AppRegistryEntry {
  type: "exe" | "appid";
  path?: string;
  id?: string;
  icon?: string;
}

export interface AppRegistry {
  apps: Record<string, AppRegistryEntry>;
}

export interface FavoriteEntry {
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

export interface AccessibilityConfig {
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
}

export interface UserProfile {
  name: string;
  language: string;
  preferences?: Record<string, unknown>;
  habits?: Record<string, number>;
  frequent_actions?: Record<string, number>;
  notes?: string[];
  created?: string;
  last_updated?: string;
}

export interface RuleCondition {
  type: "time" | "app_open" | "location" | "keyword" | "schedule";
  value: string;
  operator?: "equals" | "contains" | "greater" | "less";
}

export interface RuleAction {
  type: "open_app" | "run_command" | "send_notification" | "play_sound" | "speak";
  value: string;
  params?: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: RuleCondition;
  conditions?: RuleCondition[];
  actions: RuleAction[];
  created_at?: string;
}

export interface RulesConfig {
  rules: AutomationRule[];
}

export interface ApiKeysConfig {
  gemini_api_key: string;
  openrouter_api_key: string;
  min_voice: string;
  gpu_acceleration: boolean;
  mic_device: number;
  speaker_device: string;
  spotify_client_id: string;
  spotify_client_secret: string;
  spotify_redirect_uri: string;
  browser_preference: string;
  browser_paths: Record<string, string>;
  location_mode: string;
  location_city: string;
  location_lat: string;
  location_lon: string;
  live_model: string;
  vision_model: string;
  openrouter_default_model: string;
  timezone: string;
  language: string;
  os_system: string;
  camera_enabled: boolean;
  camera_index: number;
  max_memory_mb: number;
  llm_provider: string;
  local_openai_base_url: string;
  local_openai_model: string;
  local_openai_api_key: string;
  local_openai_reasoning: boolean;
}

// Default values
const DEFAULT_APP_REGISTRY: AppRegistry = { apps: {} };
const DEFAULT_FAVORITES: FavoriteEntry[] = [];
const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
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
const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Usuario",
  language: "es",
};
const DEFAULT_RULES: RulesConfig = { rules: [] };

// LocalStorage keys for browser fallback
const STORAGE_KEYS = {
  app_registry: "min_app_registry",
  favorites: "min_favorites",
  accessibility: "min_accessibility",
  user_profile: "min_user_profile",
  rules: "min_rules",
  api_keys: "min_api_keys",
};

// Check if running in Tauri
const isTauri = () => !!(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;

// Config file paths (relative to app data dir)
const CONFIG_PATHS = {
  app_registry: "config/app_registry.json",
  favorites: "config/favorites.json",
  accessibility: "config/accessibility_config.json",
  user_profile: "config/user_profile.json",
  rules: "config/rules.json",
  api_keys: "config/api_keys.json",
};

export function useConfig() {
  const [appRegistry, setAppRegistry] = useState<AppRegistry>(DEFAULT_APP_REGISTRY);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(DEFAULT_FAVORITES);
  const [accessibility, setAccessibility] = useState<AccessibilityConfig>(DEFAULT_ACCESSIBILITY);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [rules, setRules] = useState<RulesConfig>(DEFAULT_RULES);
  const [apiKeys, setApiKeys] = useState<Partial<ApiKeysConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage (fallback)
  const loadFromStorage = useCallback(<T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (err) {
      console.error(`[useConfig] Error loading ${key} from localStorage:`, err);
    }
    return defaultValue;
  }, []);

  // Save to localStorage (fallback)
  const saveToStorage = useCallback(<T,>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[useConfig] Error saving ${key} to localStorage:`, err);
    }
  }, []);

  // Load from Tauri filesystem
  const loadFromTauri = useCallback(async <T,>(path: string, defaultValue: T): Promise<T> => {
    try {
      const { readTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
      const content = await readTextFile(path, { baseDir: BaseDirectory.AppData });
      return JSON.parse(content) as T;
    } catch (err) {
      // File might not exist yet, return default
      console.log(`[useConfig] Config file not found: ${path}, using defaults`);
      return defaultValue;
    }
  }, []);

  // Save to Tauri filesystem
  const saveToTauri = useCallback(async <T,>(path: string, value: T): Promise<void> => {
    try {
      const { writeTextFile, mkdir, BaseDirectory } = await import("@tauri-apps/plugin-fs");
      // Ensure config directory exists
      await mkdir("config", { baseDir: BaseDirectory.AppData, recursive: true }).catch(() => {});
      await writeTextFile(path, JSON.stringify(value, null, 2), { baseDir: BaseDirectory.AppData });
    } catch (err) {
      console.error(`[useConfig] Error saving to Tauri filesystem:`, err);
      throw err;
    }
  }, []);

  // Generic load function
  const loadConfig = useCallback(async <T,>(
    path: string,
    storageKey: string,
    defaultValue: T
  ): Promise<T> => {
    if (isTauri()) {
      return loadFromTauri(path, defaultValue);
    }
    return loadFromStorage(storageKey, defaultValue);
  }, [loadFromTauri, loadFromStorage]);

  // Generic save function
  const saveConfig = useCallback(async <T,>(
    path: string,
    storageKey: string,
    value: T
  ): Promise<void> => {
    if (isTauri()) {
      await saveToTauri(path, value);
    } else {
      saveToStorage(storageKey, value);
    }
  }, [saveToTauri, saveToStorage]);

  // Load all configs on mount
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const [
          loadedRegistry,
          loadedFavorites,
          loadedAccessibility,
          loadedProfile,
          loadedRules,
          loadedApiKeys,
        ] = await Promise.all([
          loadConfig(CONFIG_PATHS.app_registry, STORAGE_KEYS.app_registry, DEFAULT_APP_REGISTRY),
          loadConfig(CONFIG_PATHS.favorites, STORAGE_KEYS.favorites, DEFAULT_FAVORITES),
          loadConfig(CONFIG_PATHS.accessibility, STORAGE_KEYS.accessibility, DEFAULT_ACCESSIBILITY),
          loadConfig(CONFIG_PATHS.user_profile, STORAGE_KEYS.user_profile, DEFAULT_USER_PROFILE),
          loadConfig(CONFIG_PATHS.rules, STORAGE_KEYS.rules, DEFAULT_RULES),
          loadConfig(CONFIG_PATHS.api_keys, STORAGE_KEYS.api_keys, {}),
        ]);

        setAppRegistry(loadedRegistry);
        setFavorites(loadedFavorites);
        setAccessibility(loadedAccessibility);
        setUserProfile(loadedProfile);
        setRules(loadedRules);
        setApiKeys(loadedApiKeys);
      } catch (err) {
        console.error("[useConfig] Error loading configs:", err);
        setError("Error al cargar configuraciones");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [loadConfig]);

  // ── App Registry Operations ─────────────────────────────────────────────────
  const updateAppRegistry = useCallback(async (newRegistry: AppRegistry) => {
    setAppRegistry(newRegistry);
    await saveConfig(CONFIG_PATHS.app_registry, STORAGE_KEYS.app_registry, newRegistry);
  }, [saveConfig]);

  const addApp = useCallback(async (
    alias: string,
    entry: AppRegistryEntry
  ) => {
    const newRegistry = {
      apps: { ...appRegistry.apps, [alias]: entry }
    };
    await updateAppRegistry(newRegistry);
  }, [appRegistry, updateAppRegistry]);

  const removeApp = useCallback(async (alias: string) => {
    const newApps = { ...appRegistry.apps };
    delete newApps[alias];
    await updateAppRegistry({ apps: newApps });
  }, [appRegistry, updateAppRegistry]);

  const updateApp = useCallback(async (
    alias: string,
    updates: Partial<AppRegistryEntry>
  ) => {
    if (!appRegistry.apps[alias]) return;
    const newRegistry = {
      apps: {
        ...appRegistry.apps,
        [alias]: { ...appRegistry.apps[alias], ...updates }
      }
    };
    await updateAppRegistry(newRegistry);
  }, [appRegistry, updateAppRegistry]);

  // ── Favorites Operations ────────────────────────────────────────────────────
  const updateFavorites = useCallback(async (newFavorites: FavoriteEntry[]) => {
    setFavorites(newFavorites);
    await saveConfig(CONFIG_PATHS.favorites, STORAGE_KEYS.favorites, newFavorites);
  }, [saveConfig]);

  const addFavorite = useCallback(async (entry: FavoriteEntry) => {
    const newFavorites = [...favorites, entry];
    await updateFavorites(newFavorites);
  }, [favorites, updateFavorites]);

  const removeFavorite = useCallback(async (url: string) => {
    const newFavorites = favorites.filter(f => f.url !== url);
    await updateFavorites(newFavorites);
  }, [favorites, updateFavorites]);

  // ── Accessibility Operations ────────────────────────────────────────────────
  const updateAccessibility = useCallback(async (
    updates: Partial<AccessibilityConfig>
  ) => {
    const newConfig = { ...accessibility, ...updates };
    setAccessibility(newConfig);
    await saveConfig(CONFIG_PATHS.accessibility, STORAGE_KEYS.accessibility, newConfig);
  }, [accessibility, saveConfig]);

  // ── User Profile Operations ─────────────────────────────────────────────────
  const updateUserProfile = useCallback(async (
    updates: Partial<UserProfile>
  ) => {
    const newProfile = { 
      ...userProfile, 
      ...updates,
      last_updated: new Date().toISOString()
    };
    setUserProfile(newProfile);
    await saveConfig(CONFIG_PATHS.user_profile, STORAGE_KEYS.user_profile, newProfile);
  }, [userProfile, saveConfig]);

  // ── Rules Operations ────────────────────────────────────────────────────────
  const updateRules = useCallback(async (newRules: RulesConfig) => {
    setRules(newRules);
    await saveConfig(CONFIG_PATHS.rules, STORAGE_KEYS.rules, newRules);
  }, [saveConfig]);

  const addRule = useCallback(async (rule: Omit<AutomationRule, "id" | "created_at">) => {
    const newRule: AutomationRule = {
      ...rule,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const newRules = { rules: [...rules.rules, newRule] };
    await updateRules(newRules);
    return newRule;
  }, [rules, updateRules]);

  const removeRule = useCallback(async (id: string) => {
    const newRules = { rules: rules.rules.filter(r => r.id !== id) };
    await updateRules(newRules);
  }, [rules, updateRules]);

  const updateRule = useCallback(async (
    id: string,
    updates: Partial<AutomationRule>
  ) => {
    const newRules = {
      rules: rules.rules.map(r => 
        r.id === id ? { ...r, ...updates } : r
      )
    };
    await updateRules(newRules);
  }, [rules, updateRules]);

  const toggleRule = useCallback(async (id: string) => {
    const rule = rules.rules.find(r => r.id === id);
    if (rule) {
      await updateRule(id, { enabled: !rule.enabled });
    }
  }, [rules, updateRule]);

  // ── API Keys Operations ─────────────────────────────────────────────────────
  const updateApiKeys = useCallback(async (
    updates: Partial<ApiKeysConfig>
  ) => {
    const newConfig = { ...apiKeys, ...updates };
    setApiKeys(newConfig);
    await saveConfig(CONFIG_PATHS.api_keys, STORAGE_KEYS.api_keys, newConfig);
  }, [apiKeys, saveConfig]);

  return {
    // State
    loading,
    error,
    
    // Data
    appRegistry,
    favorites,
    accessibility,
    userProfile,
    rules,
    apiKeys,

    // App Registry
    updateAppRegistry,
    addApp,
    removeApp,
    updateApp,

    // Favorites
    updateFavorites,
    addFavorite,
    removeFavorite,

    // Accessibility
    updateAccessibility,

    // User Profile
    updateUserProfile,

    // Rules
    updateRules,
    addRule,
    removeRule,
    updateRule,
    toggleRule,

    // API Keys
    updateApiKeys,

    // Reload all
    reload: async () => {
      setLoading(true);
      const [reg, favs, acc, prof, rls, keys] = await Promise.all([
        loadConfig(CONFIG_PATHS.app_registry, STORAGE_KEYS.app_registry, DEFAULT_APP_REGISTRY),
        loadConfig(CONFIG_PATHS.favorites, STORAGE_KEYS.favorites, DEFAULT_FAVORITES),
        loadConfig(CONFIG_PATHS.accessibility, STORAGE_KEYS.accessibility, DEFAULT_ACCESSIBILITY),
        loadConfig(CONFIG_PATHS.user_profile, STORAGE_KEYS.user_profile, DEFAULT_USER_PROFILE),
        loadConfig(CONFIG_PATHS.rules, STORAGE_KEYS.rules, DEFAULT_RULES),
        loadConfig(CONFIG_PATHS.api_keys, STORAGE_KEYS.api_keys, {}),
      ]);
      setAppRegistry(reg);
      setFavorites(favs);
      setAccessibility(acc);
      setUserProfile(prof);
      setRules(rls);
      setApiKeys(keys);
      setLoading(false);
    },
  };
}
