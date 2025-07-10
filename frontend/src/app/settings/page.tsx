'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { secureStorage } from '@/lib/storage';
import StorageManager from '@/components/StorageManager';
import SessionManager from '@/components/SessionManager';
import Link from 'next/link';

export default function Settings() {
  const { 
    apiProvider, 
    apiModel, 
    apiKey,
    isTestingApi,
    apiTestResult,
    setApiProvider, 
    setApiModel,
    setApiKey,
    testApiConnection
  } = useAppStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all stored data including API keys?')) {
      secureStorage.clearAll();
      setApiKey('');
      setApiProvider('openrouter');
      setApiModel('google/gemini-2.5-flash-lite-preview-06-17');
      alert('All data cleared successfully!');
    }
  };
  
  const providerOptions = [
    { 
      value: 'openrouter', 
      label: 'OpenRouter', 
      description: 'Access to multiple models via OpenRouter' 
    }
    // Temporarily disabled - focus on OpenRouter for now
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
  ];

  const modelOptions = {
    openrouter: [
      'google/gemini-2.5-flash-lite-preview-06-17'
    ],
    openai: [
      'gpt-4-vision-preview',
      'gpt-4o'
    ],
    anthropic: [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229'
    ]
  };

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
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">
            Configure your API settings and model preferences
          </p>
        </div>

        {/* Comic Book Library */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <SessionManager />
        </div>

        {/* API Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">API Configuration</h2>
          
          <div className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                LLM Provider
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
                Model
              </label>
              <select
                value={apiModel}
                onChange={(e) => setApiModel(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {modelOptions[apiProvider].map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current:</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  {apiModel}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose the model that best fits your needs and budget
              </p>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type={showApiKeyInput ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${apiProvider} API key`}
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
                    disabled={!apiKey.trim() || isTestingApi}
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
                          {apiTestResult.success ? 'Connection Successful!' : 'Connection Failed'}
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
                  Your API key is stored locally in your browser and never sent to our servers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Privacy & Data Management</h2>
          
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">🔒</span>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Your Privacy is Protected
                  </p>
                  <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                    <li>• API keys are stored locally in your browser only</li>
                    <li>• No data is sent to our servers or stored in the cloud</li>
                    <li>• All processing happens on your device and LLM providers</li>
                    <li>• Your API keys are never committed to GitHub</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Clear Stored Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remove all locally stored API keys and settings
                </p>
              </div>
              <button
                onClick={handleClearData}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Getting API Keys */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Getting API Keys</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Get your OpenRouter API key:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Visit{' '}
                    <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      openrouter.ai
                    </a>{' '}to create an account and get your API key
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Go to "Keys" section in your dashboard
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Create a new API key and copy it
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Tip: OpenRouter Recommended
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    OpenRouter provides access to many models including Google's Gemini with competitive pricing and no waitlists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Management */}
        <StorageManager />

        {/* Usage Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Usage Tips</h2>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong className="text-gray-900 dark:text-white">OpenRouter:</strong> Recommended for access to multiple models with competitive pricing
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Image Quality:</strong> Higher resolution images generally produce better text extraction
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Cost Management:</strong> Vision models are more expensive than text-only models
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Languages:</strong> Currently optimized for English to Chinese translation
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Storage:</strong> Hash-based deduplication automatically saves space by storing identical files only once
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}