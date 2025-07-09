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

export interface BatchPage {
  id: string;
  file: File;
  filename?: string;
  sessionId?: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  result?: ComicResult;
  error?: string;
  order: number;
}

interface AppState {
  // Current processing state
  isProcessing: boolean;
  currentFile: File | null;
  currentResult: ComicResult | null;
  error: string | null;
  
  // Batch processing state
  batchMode: boolean;
  batchPages: BatchPage[];
  batchProcessing: boolean;
  
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
  
  // Batch actions
  setBatchMode: (batchMode: boolean) => void;
  setBatchPages: (pages: BatchPage[]) => void;
  setBatchProcessing: (processing: boolean) => void;
  updateBatchPage: (id: string, updates: Partial<BatchPage>) => void;
  resetBatch: () => void;
  
  // API calls
  uploadFile: (file: File) => Promise<{ filename: string; sessionId: string }>;
  processComic: (filename: string, sessionId: string) => Promise<ComicResult>;
  testApiConnection: () => Promise<{ success: boolean; message: string }>;
  processBatch: (files: File[]) => Promise<void>;
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
    batchMode: false,
    batchPages: [],
    batchProcessing: false,
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
    
    // Batch actions
    setBatchMode: (batchMode) => set({ batchMode }),
    setBatchPages: (batchPages) => set({ batchPages }),
    setBatchProcessing: (batchProcessing) => set({ batchProcessing }),
    updateBatchPage: (id, updates) => set((state) => ({
      batchPages: state.batchPages.map(page => 
        page.id === id ? { ...page, ...updates } : page
      )
    })),
    resetBatch: () => set({ batchMode: false, batchPages: [], batchProcessing: false }),
  
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
  },
  
  // Batch processing
  processBatch: async (files: File[]) => {
    const { setBatchMode, setBatchPages, setBatchProcessing, updateBatchPage, uploadFile, processComic } = get();
    
    // Create batch pages with unique IDs and preserve file order
    const batchPages: BatchPage[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      status: 'pending' as const,
      order: index + 1
    }));
    
    setBatchMode(true);
    setBatchPages(batchPages);
    setBatchProcessing(true);
    
    // Process pages in parallel but display results in order
    const processPromises = batchPages.map(async (page) => {
      try {
        // Upload file
        updateBatchPage(page.id, { status: 'uploading' });
        const { filename, sessionId } = await uploadFile(page.file);
        updateBatchPage(page.id, { filename, sessionId, status: 'processing' });
        
        // Process comic
        const result = await processComic(filename, sessionId);
        updateBatchPage(page.id, { result, status: 'completed' });
        
      } catch (error) {
        updateBatchPage(page.id, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Processing failed' 
        });
      }
    });
    
    // Wait for all processing to complete
    await Promise.allSettled(processPromises);
    setBatchProcessing(false);
  }
  };
});