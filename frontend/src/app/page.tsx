'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import FileUpload from '@/components/FileUpload';
import TextDisplay from '@/components/TextDisplay';
import ExportOptions from '@/components/ExportOptions';

export default function Home() {
  const {
    isProcessing,
    currentFile,
    currentResult,
    error,
    setProcessing,
    setCurrentFile,
    setCurrentResult,
    setError,
    uploadFile,
    processComic
  } = useAppStore();

  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      setProcessing(true);
      setCurrentFile(file);
      
      // Upload file
      const { filename, sessionId } = await uploadFile(file);
      
      // Process comic
      const result = await processComic(filename, sessionId);
      setCurrentResult(result);
      
    } catch (err) {
      console.error('Error processing comic:', err);
      setError(err instanceof Error ? err.message : 'Failed to process comic');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentFile(null);
    setCurrentResult(null);
    setError(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">ComicLLM</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Local comic text extraction and translation tool using LLMs
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 rounded-lg">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error</h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={handleReset}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content */}
      {!currentResult ? (
        <FileUpload
          onFileSelect={handleFileSelect}
          isProcessing={isProcessing}
        />
      ) : (
        <div>
          {/* File Info and Actions */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Processed:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{currentFile?.name}</span>
              <div className="flex items-center gap-2 ml-2">
                <ExportOptions 
                  result={currentResult}
                  filename={currentFile?.name || 'comic'}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                  className="hidden"
                  id="new-file-input"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="new-file-input"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  } text-white`}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>📁</span>
                      <span>Upload New</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-spin">⏳</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Processing New Comic
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Analyzing image and extracting text...
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    This may take a few moments
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Text Display */}
          <TextDisplay
            texts={currentResult.reading_order}
            pageNumber={currentResult.page_number}
          />
        </div>
      )}
    </main>
  );
}