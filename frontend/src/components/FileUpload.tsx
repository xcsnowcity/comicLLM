'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing?: boolean;
}

export default function FileUpload({ onFilesSelect, isProcessing = false }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelect(acceptedFiles);
    }
  }, [onFilesSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: isProcessing
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-6xl text-gray-400 dark:text-gray-500 mb-4">
          {isProcessing ? '⏳' : '📚'}
        </div>
        
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          {isProcessing ? 'Processing...' : 'Upload Comic Pages'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {isProcessing 
            ? 'Please wait while we analyze your comics...'
            : isDragActive 
              ? 'Drop the comic pages here'
              : 'Drop comic pages here or click to select'
          }
        </p>
        
        {!isProcessing && (
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            disabled={isProcessing}
          >
            Select Pages
          </button>
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Supported formats: JPEG, PNG, GIF, WebP (max 10MB each)
        <br />
        Select single or multiple files - smart ordering applied automatically
      </div>
    </div>
  );
}