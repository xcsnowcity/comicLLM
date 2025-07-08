import { create } from 'zustand';
import axios from 'axios';
import { secureStorage, getInitialStoreValues } from './storage';

interface ComicText {
  sequence: number;
  type: string;
  character?: string;
  original_text: string;
  chinese_translation: string;
  explanations: Array<{
    phrase: string;
    meaning: string;
    context: string;
  }>;
}

interface ComicResult {
  page_number: number;
  reading_order: ComicText[];
}

interface AppState {
  // Current processing state
  isProcessing: boolean;
  currentFile: File | null;
  currentResult: ComicResult | null;
  error: string | null;
  
  // Settings
  apiProvider: 'openrouter' | 'openai' | 'anthropic';
  apiModel: string;
  apiKey: string;
  
  // API test state
  isTestingApi: boolean;
  apiTestResult: { success: boolean; message: string } | null;
  
  // Actions
  setProcessing: (processing: boolean) => void;
  setCurrentFile: (file: File | null) => void;
  setCurrentResult: (result: ComicResult | null) => void;
  setError: (error: string | null) => void;
  setApiProvider: (provider: 'openrouter' | 'openai' | 'anthropic') => void;
  setApiModel: (model: string) => void;
  setApiKey: (key: string) => void;
  setIsTestingApi: (testing: boolean) => void;
  setApiTestResult: (result: { success: boolean; message: string } | null) => void;
  
  // API calls
  uploadFile: (file: File) => Promise<{ filename: string; sessionId: string }>;
  processComic: (filename: string, sessionId: string) => Promise<ComicResult>;
  testApiConnection: () => Promise<{ success: boolean; message: string }>;
}

export const useAppStore = create<AppState>((set, get) => {
  // Get initial values from localStorage
  const initialValues = getInitialStoreValues();
  
  return {
    // Initial state
    isProcessing: false,
    currentFile: null,
    currentResult: null,
    error: null,
    apiProvider: initialValues.apiProvider,
    apiModel: initialValues.apiModel,
    apiKey: initialValues.apiKey,
    isTestingApi: false,
    apiTestResult: null,
  
    // Actions
    setProcessing: (processing) => set({ isProcessing: processing }),
    setCurrentFile: (file) => set({ currentFile: file }),
    setCurrentResult: (result) => set({ currentResult: result }),
    setError: (error) => set({ error }),
    setApiProvider: (provider) => {
      set({ apiProvider: provider });
      secureStorage.saveApiProvider(provider);
    },
    setApiModel: (model) => {
      set({ apiModel: model });
      secureStorage.saveApiModel(model);
    },
    setApiKey: (key) => {
      set({ apiKey: key });
      secureStorage.saveApiKey(key);
    },
    setIsTestingApi: (testing) => set({ isTestingApi: testing }),
    setApiTestResult: (result) => set({ apiTestResult: result }),
  
  // API calls
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('comic', file);
    
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      filename: response.data.filename,
      sessionId: response.data.sessionId
    };
  },
  
  processComic: async (filename: string, sessionId: string) => {
    const { apiProvider, apiModel, apiKey } = get();
    
    const response = await axios.post('/api/process', {
      filename,
      sessionId,
      provider: apiProvider,
      model: apiModel,
      apiKey
    });
    
    return response.data;
  },
  
  testApiConnection: async () => {
    const { apiProvider, apiModel, apiKey, setIsTestingApi, setApiTestResult } = get();
    
    if (!apiKey.trim()) {
      return { success: false, message: 'API key is required' };
    }
    
    try {
      setIsTestingApi(true);
      
      const response = await axios.post('/api/test-connection', {
        provider: apiProvider,
        model: apiModel,
        apiKey
      });
      
      const result = { success: true, message: response.data.message || 'Connection successful!' };
      setApiTestResult(result);
      return result;
    } catch (error: any) {
      const result = {
        success: false,
        message: error.response?.data?.details || error.message || 'Connection failed'
      };
      setApiTestResult(result);
      return result;
    } finally {
      setIsTestingApi(false);
    }
  }
  };
});