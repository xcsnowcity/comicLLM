// Local storage utilities for sensitive data
// This ensures API keys are stored locally and never uploaded to GitHub

const STORAGE_KEYS = {
  API_KEY: 'comicllm_api_key',
  API_PROVIDER: 'comicllm_api_provider',
  API_MODEL: 'comicllm_api_model',
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

  // Clear all stored data
  clearAll: (): void => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }
};

// Initialize store with persisted values
export const getInitialStoreValues = () => {
  return {
    apiKey: secureStorage.getApiKey(),
    apiProvider: secureStorage.getApiProvider() as 'openrouter' | 'openai' | 'anthropic',
    apiModel: secureStorage.getApiModel(),
  };
};