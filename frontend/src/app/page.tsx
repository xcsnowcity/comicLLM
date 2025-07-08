'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import FileUpload from '@/components/FileUpload';
import TextDisplay from '@/components/TextDisplay';

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
          {/* File Info */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Processed:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{currentFile?.name}</span>
              <button
                onClick={handleReset}
                className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Upload New
              </button>
            </div>
          </div>

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