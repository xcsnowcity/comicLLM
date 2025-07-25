'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { toastManager } from '@/lib/toastManager';
import FileUpload from '@/components/FileUpload';
import FilePreview from '@/components/FilePreview';
import TextDisplay from '@/components/TextDisplay';
import ExportOptions from '@/components/ExportOptions';
import BatchDisplay from '@/components/BatchDisplay';
import SessionControl from '@/components/SessionControl';
import { smartSortFiles, FileItem, fileItemsToFiles } from '@/lib/fileUtils';
import { useT } from '@/lib/i18nContext';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const t = useT();
  
  const {
    isProcessing,
    currentFile,
    currentResult,
    error,
    batchMode,
    batchPages,
    batchProcessing,
    setProcessing,
    setCurrentFile,
    setCurrentResult,
    setError,
    uploadFile,
    processComic,
    processBatch,
    resetBatch
  } = useAppStore();

  // Check for continued session message on page load
  useEffect(() => {
    const storedMessage = sessionStorage.getItem('continuedSession');
    if (storedMessage) {
      try {
        const { message, type } = JSON.parse(storedMessage);
        // Add a small delay to ensure toast manager is ready
        setTimeout(() => {
          if (type === 'success') {
            toastManager.success(message, 4000);
          } else if (type === 'error') {
            toastManager.error(message);
          }
        }, 100);
        // Clear the message after showing it
        sessionStorage.removeItem('continuedSession');
      } catch (error) {
        console.error('Failed to parse continued session message:', error);
        sessionStorage.removeItem('continuedSession');
      }
    }
  }, []);

  const handleFilesSelect = (files: File[]) => {
    // Get existing file names to avoid duplicates
    const existingFileNames = new Set(selectedFiles.map(f => f.file.name));
    
    // Filter out duplicate files
    const newFiles = files.filter(file => !existingFileNames.has(file.name));
    const duplicateCount = files.length - newFiles.length;
    
    if (newFiles.length === 0) {
      // All files were duplicates, show a message
      setDuplicateMessage(`${duplicateCount} file${duplicateCount > 1 ? 's' : ''} already selected`);
      setTimeout(() => setDuplicateMessage(null), 3000);
      return;
    }
    
    // Show duplicate message if some files were duplicates
    if (duplicateCount > 0) {
      setDuplicateMessage(`${duplicateCount} duplicate file${duplicateCount > 1 ? 's' : ''} ignored`);
      setTimeout(() => setDuplicateMessage(null), 3000);
    }
    
    // Combine existing and new files
    const allFiles = [...selectedFiles.map(f => f.file), ...newFiles];
    
    // Apply smart sorting to all files
    const sortedFiles = smartSortFiles(allFiles);
    setSelectedFiles(sortedFiles);
    setError(null);
  };

  const handleFilesReorder = (reorderedFiles: FileItem[]) => {
    setSelectedFiles(reorderedFiles);
  };

  const handleRemoveFile = (fileId: string) => {
    const newFiles = selectedFiles.filter(f => f.id !== fileId);
    // Update order numbers
    const reorderedFiles = newFiles.map((file, index) => ({
      ...file,
      order: index + 1
    }));
    setSelectedFiles(reorderedFiles);
  };

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setError(null);
      const files = fileItemsToFiles(selectedFiles);
      await processBatch(files);
    } catch (err) {
      console.error('Error processing files:', err);
      setError(err instanceof Error ? err.message : 'Failed to process files');
    }
  };

  const handleReset = () => {
    setCurrentFile(null);
    setCurrentResult(null);
    setError(null);
    setSelectedFiles([]);
    resetBatch();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t.app.title}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          {t.app.subtitle}
        </p>
        <div className="flex items-center justify-center">
          <a
            href="https://github.com/xcsnowcity/comicLLM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            {t.app.github}
          </a>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 rounded-lg">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">{t.common.error}</h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={handleReset}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t.common.tryAgain}
          </button>
        </div>
      )}

      {/* Duplicate Files Message */}
      {duplicateMessage && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-600 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 dark:text-yellow-400">ℹ️</span>
            <p className="text-yellow-800 dark:text-yellow-200">{duplicateMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!batchMode ? (
        <>
          {/* Session Control */}
          <div className="max-w-4xl mx-auto mb-8">
            <SessionControl />
          </div>
          
          {/* File Upload */}
          <FileUpload
            onFilesSelect={handleFilesSelect}
            isProcessing={batchProcessing}
          />
          
          {/* File Preview (if files selected) */}
          {selectedFiles.length > 0 && (
            <div className="mt-12">
              <FilePreview
                files={selectedFiles}
                onFilesReorder={handleFilesReorder}
                onRemoveFile={handleRemoveFile}
                onProcessFiles={handleProcessFiles}
                isProcessing={batchProcessing}
              />
            </div>
          )}
        </>
      ) : (
        <BatchDisplay
          pages={batchPages}
          onReset={handleReset}
        />
      )}
      
    </main>
  );
}