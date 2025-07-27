// Local storage utilities for sensitive data
// This ensures API keys are stored locally and never uploaded to GitHub

const STORAGE_KEYS = {
  API_KEY: 'comicllm_api_key',
  API_PROVIDER: 'comicllm_api_provider',
  API_MODEL: 'comicllm_api_model',
  TEMPERATURE: 'comicllm_temperature',
  CURRENT_SESSION: 'comicllm_current_session',
  AUTO_SAVE_ENABLED: 'comicllm_auto_save_enabled',
} as const;

export const secureStorage = {
  // Save API key to localStorage
  saveApiKey: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    }
  },

  // Get API key from localStorage
  getApiKey: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    }
    return '';
  },

  // Save API provider
  saveApiProvider: (provider: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.API_PROVIDER, provider);
    }
  },

  // Get API provider
  getApiProvider: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.API_PROVIDER) || 'openrouter';
    }
    return 'openrouter';
  },

  // Save API model
  saveApiModel: (model: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.API_MODEL, model);
    }
  },

  // Get API model
  getApiModel: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.API_MODEL) || 'google/gemini-2.5-flash-lite-preview-06-17';
    }
    return 'google/gemini-2.5-flash-lite-preview-06-17';
  },

  // Save temperature
  saveTemperature: (temperature: number): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TEMPERATURE, temperature.toString());
    }
  },

  // Get temperature
  getTemperature: (): number => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPERATURE);
      return saved ? parseFloat(saved) : 0.7;
    }
    return 0.7;
  },

  // Clear all stored data
  clearAll: (): void => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }
};

// Session persistence utilities
export const sessionStorage = {
  // Save current session ID
  saveCurrentSession: (sessionId: string | null): void => {
    if (typeof window !== 'undefined') {
      if (sessionId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      }
    }
  },

  // Get current session ID
  getCurrentSession: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    }
    return null;
  },

  // Save auto-save setting
  saveAutoSaveEnabled: (enabled: boolean): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_ENABLED, enabled.toString());
    }
  },

  // Get auto-save setting
  getAutoSaveEnabled: (): boolean => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE_ENABLED);
      return saved ? saved === 'true' : true; // Default to true
    }
    return true;
  },

  // Clear session data
  clearSessionData: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  }
};

// Initialize store with persisted values
export const getInitialStoreValues = () => {
  return {
    apiKey: secureStorage.getApiKey(),
    apiProvider: secureStorage.getApiProvider() as 'openrouter' | 'openai' | 'anthropic',
    apiModel: secureStorage.getApiModel(),
    temperature: secureStorage.getTemperature(),
    currentSessionId: sessionStorage.getCurrentSession(),
    autoSaveEnabled: sessionStorage.getAutoSaveEnabled(),
  };
};