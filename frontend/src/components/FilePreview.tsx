'use client';

import { useState, useRef } from 'react';

interface FileItem {
  id: string;
  file: File;
  order: number;
}

interface FilePreviewProps {
  files: FileItem[];
  onFilesReorder: (files: FileItem[]) => void;
  onRemoveFile: (fileId: string) => void;
  onProcessFiles: () => void;
  isProcessing?: boolean;
}

export default function FilePreview({ 
  files, 
  onFilesReorder, 
  onRemoveFile, 
  onProcessFiles, 
  isProcessing = false 
}: FilePreviewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFiles = [...files];
    const [draggedFile] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);
    
    // Update order numbers
    const reorderedFiles = newFiles.map((file, index) => ({
      ...file,
      order: index + 1
    }));
    
    onFilesReorder(reorderedFiles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selected Files ({files.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop to reorder pages
              </p>
            </div>
            <button
              onClick={onProcessFiles}
              disabled={isProcessing || files.length === 0}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  🚀 Process All Pages
                </>
              )}
            </button>
          </div>
        </div>

        {/* File List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {files.map((fileItem, index) => (
            <div
              key={fileItem.id}
              draggable={!isProcessing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`px-6 py-4 flex items-center gap-4 transition-all duration-200 ease-in-out ${
                draggedIndex === index 
                  ? 'opacity-50 scale-95 shadow-lg rotate-2 bg-blue-50 dark:bg-blue-900/30' 
                  : 'opacity-100 scale-100 rotate-0'
              } ${
                dragOverIndex === index 
                  ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-300 dark:border-blue-600 border-dashed' 
                  : 'border-2 border-transparent'
              } ${
                !isProcessing 
                  ? 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md cursor-move' 
                  : ''
              }`}
            >
              {/* Drag Handle */}
              <div className="flex-shrink-0">
                {!isProcessing ? (
                  <div className={`text-gray-400 dark:text-gray-500 text-lg transition-all duration-200 ${
                    draggedIndex === index ? 'text-blue-500 scale-110' : 'hover:text-gray-600 dark:hover:text-gray-300'
                  }`}>
                    ⋮⋮
                  </div>
                ) : (
                  <div className="w-4" />
                )}
              </div>

              {/* Page Number */}
              <div className="flex-shrink-0">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {fileItem.order}
                </span>
              </div>

              {/* File Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                {!isProcessing && (
                  <button
                    onClick={() => onRemoveFile(fileItem.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                    title="Remove file"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Files will be processed in the order shown above. 
            {files.length === 1 ? ' Single page mode.' : ` ${files.length} pages total.`}
          </p>
        </div>
      </div>
    </div>
  );
}