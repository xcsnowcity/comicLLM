import { create } from 'zustand';
import axios from 'axios';
import { secureStorage, sessionStorage, getInitialStoreValues } from './storage';

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
  
  // Session state
  currentSessionId: string | null;
  currentSession: any | null;
  autoSaveEnabled: boolean;
  
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
  
  // Session actions
  setCurrentSessionId: (sessionId: string | null) => void;
  setCurrentSession: (session: any | null) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  loadCurrentSession: () => Promise<void>;
  startNewSession: (name: string, description?: string) => Promise<void>;
  
  // API calls
  uploadFile: (file: File) => Promise<{ filename: string; sessionId: string }>;
  processComic: (filename: string, sessionId: string) => Promise<ComicResult>;
  testApiConnection: () => Promise<{ success: boolean; message: string }>;
  processBatch: (files: File[]) => Promise<void>;
  
  // Storage management
  getStorageStats: () => Promise<any>;
  findDuplicates: () => Promise<any>;
  cleanupStorage: () => Promise<any>;
  
  // Session management
  createSession: (name: string, description?: string, language?: string) => Promise<any>;
  getAllSessions: () => Promise<any[]>;
  getSession: (sessionId: string) => Promise<any>;
  updateSession: (sessionId: string, updates: any) => Promise<any>;
  deleteSession: (sessionId: string) => Promise<any>;
  addPageToSession: (sessionId: string, pageData: any) => Promise<any>;
  updatePageInSession: (sessionId: string, pageId: string, updates: any) => Promise<any>;
  reorderPagesInSession: (sessionId: string, pageOrders: Array<{pageId: string, order: number}>) => Promise<any>;
  exportSession: (sessionId: string, format?: 'json' | 'txt' | 'md') => Promise<any>;
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
    currentSessionId: initialValues.currentSessionId,
    currentSession: null,
    autoSaveEnabled: initialValues.autoSaveEnabled,
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
    
    // Session actions
    setCurrentSessionId: (sessionId) => {
      set({ currentSessionId: sessionId });
      sessionStorage.saveCurrentSession(sessionId);
    },
    setCurrentSession: (session) => set({ currentSession: session }),
    setAutoSaveEnabled: (enabled) => {
      set({ autoSaveEnabled: enabled });
      sessionStorage.saveAutoSaveEnabled(enabled);
    },
    
    loadCurrentSession: async () => {
      const { currentSessionId, getSession, setCurrentSessionId } = get();
      if (currentSessionId) {
        try {
          const session = await getSession(currentSessionId);
          if (session) {
            set({ currentSession: session });
          } else {
            // Session doesn't exist anymore, clear it
            console.warn(`Session ${currentSessionId} no longer exists, clearing current session`);
            setCurrentSessionId(null);
            set({ currentSession: null });
            throw new Error('Session not found');
          }
        } catch (error) {
          console.error('Failed to load current session:', error);
          setCurrentSessionId(null);
          set({ currentSession: null });
          throw error;
        }
      }
    },
    
    startNewSession: async (name: string, description?: string) => {
      const { createSession, setCurrentSessionId } = get();
      try {
        const session = await createSession(name, description, 'en-to-cn');
        setCurrentSessionId(session.id);
        set({ currentSession: session });
      } catch (error) {
        console.error('Failed to start new session:', error);
        throw error;
      }
    },
  
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
      hash: response.data.hash,
      originalName: response.data.originalName,
      reused: response.data.reused,
      sessionId: response.data.sessionId
    };
  },
  
  processComic: async (filename: string, sessionId: string, hash?: string) => {
    const { apiProvider, apiModel, apiKey } = get();
    
    const response = await axios.post('/api/process', {
      filename,
      sessionId,
      hash,
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
    const { 
      setBatchMode, 
      setBatchPages, 
      setBatchProcessing, 
      updateBatchPage, 
      uploadFile, 
      processComic,
      currentSessionId,
      autoSaveEnabled,
      createSession,
      addPageToSession,
      updatePageInSession
    } = get();
    
    // Create or use existing session for auto-save
    let sessionId = currentSessionId;
    let sessionCreated = false;
    
    if (autoSaveEnabled && !sessionId) {
      try {
        const timestamp = new Date().toISOString().split('T')[0];
        const session = await createSession(
          `Comic Book - ${timestamp}`,
          `Auto-created comic book for translation on ${new Date().toLocaleString()}`,
          'en-to-cn'
        );
        sessionId = session.id;
        sessionCreated = true;
        // Set as current session for future batches
        const { setCurrentSessionId } = get();
        setCurrentSessionId(sessionId);
        set({ currentSession: session });
        console.log(`Auto-created session: ${session.name} (${sessionId})`);
      } catch (error) {
        console.warn('Failed to create auto-save session:', error);
      }
    }
    
    // Get current session page count to determine starting order
    let startingOrder = 1;
    if (autoSaveEnabled && sessionId) {
      try {
        const currentSession = await getSession(sessionId);
        startingOrder = currentSession ? currentSession.pages.length + 1 : 1;
      } catch (error) {
        console.warn('Failed to get current session for ordering:', error);
      }
    }
    
    // Create batch pages with unique IDs and preserve file order
    const batchPages: BatchPage[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      status: 'pending' as const,
      order: startingOrder + index,
      sessionId: sessionId || undefined
    }));
    
    setBatchMode(true);
    setBatchPages(batchPages);
    setBatchProcessing(true);
    
    // Process pages in parallel but display results in order
    const processPromises = batchPages.map(async (page) => {
      try {
        // Upload file
        updateBatchPage(page.id, { status: 'uploading' });
        const { filename, hash, reused, originalName } = await uploadFile(page.file);
        updateBatchPage(page.id, { filename, status: 'processing' });
        
        // Show if file was reused
        if (reused) {
          console.log(`File reused for ${page.file.name}: ${filename}`);
        }
        
        // Process comic
        const result = await processComic(filename, page.sessionId || '', hash);
        updateBatchPage(page.id, { result, status: 'completed' });
        
        // Auto-save to session if enabled
        if (autoSaveEnabled && sessionId) {
          try {
            // Add page to session using pre-calculated order
            await addPageToSession(sessionId, {
              fileHash: hash,
              filename: filename,
              originalName: originalName || page.file.name,
              order: page.order,
              status: 'completed',
              result: result
            });
            
            console.log(`Auto-saved page to session: ${originalName || page.file.name} (order: ${page.order})`);
          } catch (error) {
            console.warn('Failed to auto-save page to session:', error);
          }
        }
        
      } catch (error) {
        updateBatchPage(page.id, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Processing failed' 
        });
        
        // Still try to save failed pages to session for tracking
        if (autoSaveEnabled && sessionId && page.filename) {
          try {
            await addPageToSession(sessionId, {
              fileHash: page.filename.split('.')[0],
              filename: page.filename,
              originalName: page.file.name,
              order: page.order,
              status: 'error'
            });
          } catch (saveError) {
            console.warn('Failed to save error page to session:', saveError);
          }
        }
      }
    });
    
    // Wait for all processing to complete
    await Promise.allSettled(processPromises);
    setBatchProcessing(false);
    
    // Refresh current session data if auto-save is enabled
    if (autoSaveEnabled && sessionId) {
      try {
        const updatedSession = await getSession(sessionId);
        set({ currentSession: updatedSession });
      } catch (error) {
        console.warn('Failed to refresh current session:', error);
      }
    }
    
    if (sessionCreated && sessionId) {
      alert(`Pages translated! Your work has been auto-saved to a new comic book. Future pages will be added to the same book.`);
    } else if (autoSaveEnabled && sessionId) {
      alert(`Pages translated! Your work has been auto-saved to the current comic book.`);
    }
  },
  
  // Storage management
  getStorageStats: async () => {
    const response = await axios.get('/api/storage/stats');
    return response.data;
  },
  
  findDuplicates: async () => {
    const response = await axios.get('/api/storage/duplicates');
    return response.data;
  },
  
  cleanupStorage: async () => {
    const response = await axios.post('/api/storage/cleanup');
    return response.data;
  },
  
  // Session management
  createSession: async (name: string, description?: string, language?: string) => {
    const response = await axios.post('/api/sessions', {
      name,
      description,
      language
    });
    return response.data;
  },
  
  getAllSessions: async () => {
    const response = await axios.get('/api/sessions');
    return response.data;
  },
  
  getSession: async (sessionId: string) => {
    const response = await axios.get(`/api/sessions/${sessionId}`);
    return response.data;
  },
  
  updateSession: async (sessionId: string, updates: any) => {
    const response = await axios.put(`/api/sessions/${sessionId}`, updates);
    return response.data;
  },
  
  deleteSession: async (sessionId: string) => {
    const response = await axios.delete(`/api/sessions/${sessionId}`);
    return response.data;
  },
  
  addPageToSession: async (sessionId: string, pageData: any) => {
    const response = await axios.post(`/api/sessions/${sessionId}/pages`, pageData);
    return response.data;
  },
  
  updatePageInSession: async (sessionId: string, pageId: string, updates: any) => {
    const response = await axios.put(`/api/sessions/${sessionId}/pages/${pageId}`, updates);
    return response.data;
  },
  
  reorderPagesInSession: async (sessionId: string, pageOrders: Array<{pageId: string, order: number}>) => {
    const response = await axios.put(`/api/sessions/${sessionId}/reorder`, { pageOrders });
    return response.data;
  },
  
  exportSession: async (sessionId: string, format: 'json' | 'txt' | 'md' = 'json') => {
    const response = await axios.post(`/api/sessions/${sessionId}/export`, { format });
    return response.data;
  }
  };
});