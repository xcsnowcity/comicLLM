'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { secureStorage } from '@/lib/storage';
import StorageManager from '@/components/StorageManager';
import SessionManager from '@/components/SessionManager';
import Link from 'next/link';
import { useT } from '@/lib/i18nContext';

export default function Settings() {
  const { 
    apiProvider, 
    apiModel, 
    apiKey,
    temperature,
    isTestingApi,
    apiTestResult,
    setApiProvider, 
    setApiModel,
    setApiKey,
    setTemperature,
    testApiConnection
  } = useAppStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const t = useT();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClearData = () => {
    if (confirm(t.settings.confirmClearData)) {
      secureStorage.clearAll();
      setApiKey('');
      setApiProvider('openrouter');
      setApiModel('google/gemini-2.5-flash-lite-preview-06-17');
      setTemperature(0.7);
      alert(t.settings.dataClearedSuccess);
    }
  };
  
  const providerOptions = [
    { 
      value: 'openrouter', 
      label: 'OpenRouter', 
      description: 'Access to multiple models via OpenRouter' 
    }
    // Other providers temporarily hidden - focusing on OpenRouter for simplicity
    // { 
    //   value: 'openai', 
    //   label: 'OpenAI', 
    //   description: 'Direct OpenAI API access' 
    // },
    // { 
    //   value: 'anthropic', 
    //   label: 'Anthropic', 
    //   description: 'Claude models via Anthropic API' 
    // }
    // DeepSeek temporarily disabled - vision capabilities not sufficient for comic processing
    // { 
    //   value: 'deepseek', 
    //   label: 'DeepSeek', 
    //   description: 'DeepSeek AI models (text-only, no vision support yet)' 
    // }
  ];

  // Model options removed - now using free text input for flexibility
  // const modelOptions = {
  //   openrouter: [
  //     'google/gemini-2.5-flash-lite-preview-06-17'
  //   ],
  //   openai: [
  //     'gpt-4-vision-preview',
  //     'gpt-4o'
  //   ],
  //   anthropic: [
  //     'claude-3-5-sonnet-20241022',
  //     'claude-3-opus-20240229'
  //   ]
  //   // DeepSeek models - commented out due to lack of vision support
  //   // deepseek: [
  //   //   'deepseek-chat',
  //   //   'deepseek-reasoner'
  //   // ]
  // };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← {t.common.backToHome}
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t.settings.title}</h1>
          <p className="text-gray-600">
            {t.settings.apiSettings}
          </p>
        </div>

        {/* Comic Book Library */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <SessionManager />
        </div>

        {/* API Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t.settings.apiSettings}</h2>
          
          <div className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t.settings.provider}
              </label>
              <div className="space-y-2">
                {providerOptions.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      value={option.value}
                      checked={apiProvider === option.value}
                      onChange={(e) => setApiProvider(e.target.value as any)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.settings.model}
              </label>
              <input
                type="text"
                value={apiModel}
                onChange={(e) => setApiModel(e.target.value)}
                placeholder={t.settings.modelPlaceholder}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t.settings.currentModel}:</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                    {apiModel || t.settings.noModelSelected}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-medium mb-1">{t.settings.popularModels}:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">google/gemini-2.5-flash-lite-preview-06-17</code> - Fast and cost-effective</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">openai/gpt-4o</code> - High quality</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">anthropic/claude-3-5-sonnet-20241022</code> - Excellent analysis</li>
                  </ul>
                  <p className="mt-2">Visit <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">openrouter.ai/models</a> for full list</p>
                </div>
              </div>
            </div>

            {/* Temperature Setting */}
            {apiProvider === 'openrouter' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature ({temperature})
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>0.0 (More focused)</span>
                    <span>1.0 (Balanced)</span>
                    <span>2.0 (More creative)</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Temperature controls the randomness of the model output. Lower values make the output more focused and deterministic, while higher values make it more creative and varied.
                  </p>
                </div>
              </div>
            )}

            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.settings.apiKey}
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type={showApiKeyInput ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t.settings.apiKeyPlaceholder}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    {showApiKeyInput ? '🙈' : '👁️'}
                  </button>
                  <button
                    type="button"
                    onClick={testApiConnection}
                    disabled={!isClient || !apiKey || !apiKey.trim() || isTestingApi}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isTestingApi ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Testing...
                      </>
                    ) : (
                      <>
                        <span>🔗</span>
                        Test
                      </>
                    )}
                  </button>
                </div>
                
                {/* Test Result */}
                {apiTestResult && (
                  <div className={`p-3 rounded-md ${
                    apiTestResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className={apiTestResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {apiTestResult.success ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className={`text-sm font-medium ${
                          apiTestResult.success 
                            ? 'text-green-800 dark:text-green-200' 
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          {apiTestResult.success ? t.settings.connectionSuccess : t.settings.connectionError}
                        </p>
                        <p className={`text-sm ${
                          apiTestResult.success 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {apiTestResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.settings.privacyNotes[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t.settings.privacyDataManagement}</h2>
          
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">🔒</span>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t.settings.privacyProtected}
                  </p>
                  <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                    {t.settings.privacyNotes.map((note, index) => (
                      <li key={index}>• {note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{t.settings.clearStoredData}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.settings.clearDataDesc}
                </p>
              </div>
              <button
                onClick={handleClearData}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {t.settings.clearAllData}
              </button>
            </div>
          </div>
        </div>

        {/* Getting API Keys */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t.settings.gettingApiKeys}</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">🔄 {t.settings.openrouterSetup}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.settings.visitOpenRouter}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.settings.goToDashboard}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.settings.createApiKey}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.settings.browseModels}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t.settings.whyOpenrouter}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {t.settings.whyOpenrouterDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Management */}
        <StorageManager />

        {/* Usage Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t.settings.usageTips}</h2>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong className="text-gray-900 dark:text-white">{t.settings.modelSelection}:</strong> {t.settings.modelSelectionDesc} <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">google/gemini-2.5-flash-lite-preview-06-17</code> {t.settings.forComicProcessing}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">{t.settings.costQuality}:</strong> {t.settings.costQualityDesc}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">{t.settings.imageQuality}:</strong> {t.settings.imageQualityDesc}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">{t.settings.modelPricing}:</strong> {t.settings.modelPricingDesc}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">{t.settings.languages}:</strong> {t.settings.languagesDesc}
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">{t.settings.storage}:</strong> {t.settings.storageDesc}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}