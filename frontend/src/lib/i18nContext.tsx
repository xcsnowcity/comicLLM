'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language, TranslationKeys } from './i18n';
import { getSavedLanguage, saveLanguage } from './i18n';
import { getTranslations } from './translations';

interface I18nContextType {
  language: Language;
  t: TranslationKeys;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = getSavedLanguage();
    setLanguageState(savedLanguage);
    setIsLoading(false);
  }, []);

  // Update language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    saveLanguage(newLanguage);
  };

  // Get current translations
  const t = getTranslations(language);

  const value: I18nContextType = {
    language,
    t,
    setLanguage,
    isLoading,
  };

  // Don't render children until language is loaded to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Convenience hook for just getting translations
export function useT(): TranslationKeys {
  const { t } = useI18n();
  return t;
}