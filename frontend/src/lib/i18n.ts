// i18n utility functions and types

export type Language = 'en' | 'zh';

export interface TranslationKeys {
  // Navigation
  nav: {
    home: string;
    settings: string;
    library: string;
  };

  // App info
  app: {
    title: string;
    subtitle: string;
    github: string;
  };
  
  // Common buttons and actions
  common: {
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    export: string;
    refresh: string;
    close: string;
    previous: string;
    next: string;
    go: string;
    yes: string;
    no: string;
    ok: string;
    loading: string;
    error: string;
    success: string;
    continue: string;
    create: string;
    update: string;
    upload: string;
    process: string;
    retry: string;
    clear: string;
    reset: string;
    tryAgain: string;
    backToHome: string;
    autoSave: string;
    current: string;
    translated: string;
    created: string;
    noComicSelected: string;
    continueReading: string;
    startNewComic: string;
    startReading: string;
    newComic: string;
    comicBookTitle: string;
    description: string;
    dropPages: string;
    selectPages: string;
    processing: string;
    pleaseWait: string;
    smartOrdering: string;
    autoCreateSession: string;
    pagesWithoutSession: string;
  };
  
  // File Upload
  upload: {
    title: string;
    dragDrop: string;
    orClickSelect: string;
    supportedFormats: string;
    maxSize: string;
    selectFile: string;
    processing: string;
    uploadSuccess: string;
    uploadError: string;
    invalidFormat: string;
    fileTooLarge: string;
  };
  
  // Session Management
  session: {
    currentSession: string;
    noActiveSession: string;
    createNewSession: string;
    switchSession: string;
    sessionCreated: string;
    nowReading: string;
    addToCurrentSession: string;
    createAndStartReading: string;
    sessionName: string;
    sessionDescription: string;
    sessionNamePlaceholder: string;
    sessionDescriptionPlaceholder: string;
  };
  
  // Comic Library
  library: {
    title: string;
    noComics: string;
    noComicsDescription: string;
    newComic: string;
    createComic: string;
    editComic: string;
    comicTitle: string;
    description: string;
    created: string;
    updated: string;
    pages: string;
    completed: string;
    totalPages: string;
    continueReading: string;
    viewTranslations: string;
    editDetails: string;
    exportJson: string;
    exportTxt: string;
    exportMarkdown: string;
    deleteComic: string;
    deleteConfirm: string;
    comicDeleted: string;
    exportSuccess: string;
    exportError: string;
    comicTitlePlaceholder: string;
    descriptionPlaceholder: string;
    saveChanges: string;
    noPages: string;
    addedAt: string;
  };
  
  // Translation Viewer
  translations: {
    title: string;
    loadingTranslations: string;
    noTranslationData: string;
    pageInfo: string;
    status: string;
    added: string;
    originalText: string;
    chineseTranslation: string;
    explanations: string;
    meaning: string;
    context: string;
    jumpToPage: string;
    enterPageNumber: string;
    invalidPageNumber: string;
    noPages: string;
  };
  
  // Settings
  settings: {
    title: string;
    language: string;
    selectLanguage: string;
    apiSettings: string;
    provider: string;
    model: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    testConnection: string;
    connectionSuccess: string;
    connectionError: string;
    invalidApiKey: string;
    theme: string;
    darkMode: string;
    lightMode: string;
    systemTheme: string;
  };
  
  // Text Processing
  processing: {
    analyzing: string;
    extractingText: string;
    translating: string;
    processingComplete: string;
    processingError: string;
    noTextFound: string;
    tryAgain: string;
    analysisResults: string;
    textExtracted: string;
    translationComplete: string;
  };
  
  // Export
  export: {
    exportOptions: string;
    exportFormat: string;
    exportSuccess: string;
    exportError: string;
    downloadReady: string;
  };
  
  // Errors and validation
  validation: {
    required: string;
    invalidInput: string;
    fileRequired: string;
    sessionRequired: string;
    apiKeyRequired: string;
    connectionFailed: string;
    processingFailed: string;
    uploadFailed: string;
    unexpectedError: string;
  };
}

// Translation storage key
export const LANGUAGE_STORAGE_KEY = 'comicllm-language';

// Get saved language or default to English
export function getSavedLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (saved === 'zh' || saved === 'en') ? saved : 'en';
  } catch {
    return 'en';
  }
}

// Save language preference
export function saveLanguage(language: Language): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore localStorage errors
  }
}