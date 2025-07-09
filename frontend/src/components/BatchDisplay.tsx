'use client';

import { useState } from 'react';
import TextDisplay from './TextDisplay';
import ExportOptions from './ExportOptions';
import { BatchPage } from '@/lib/store';

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


interface BatchDisplayProps {
  pages: BatchPage[];
  onReset: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return '⏳';
    case 'uploading': return '📤';
    case 'processing': return '🔄';
    case 'completed': return '✅';
    case 'error': return '❌';
    default: return '❓';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Waiting...';
    case 'uploading': return 'Uploading...';
    case 'processing': return 'Processing...';
    case 'completed': return 'Completed';
    case 'error': return 'Error';
    default: return 'Unknown';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'text-gray-500';
    case 'uploading': return 'text-blue-500';
    case 'processing': return 'text-yellow-500';
    case 'completed': return 'text-green-500';
    case 'error': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export default function BatchDisplay({ pages, onReset }: BatchDisplayProps) {
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  
  const togglePageExpansion = (pageId: string) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  // Sort pages by order to maintain sequence
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  
  // Calculate batch statistics
  const completedPages = pages.filter(p => p.status === 'completed');
  const errorPages = pages.filter(p => p.status === 'error');
  const processingPages = pages.filter(p => p.status === 'processing' || p.status === 'uploading');
  
  // Create combined result for export
  const combinedResult = {
    page_number: 1,
    reading_order: completedPages
      .sort((a, b) => a.order - b.order)
      .flatMap(page => page.result?.reading_order || [])
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Statistics */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Batch Processing Results
        </h2>
        
        <div className="flex justify-center items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✅</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completedPages.length} completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">🔄</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {processingPages.length} processing
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500">❌</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {errorPages.length} errors
            </span>
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-4">
          {completedPages.length > 0 && (
            <ExportOptions 
              result={combinedResult}
              filename={`batch-${pages.length}-pages`}
            />
          )}
          <button
            onClick={onReset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📁 Upload New Batch
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="space-y-6">
        {sortedPages.map((page) => (
          <div key={page.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Page Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Page {page.order}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {page.file.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(page.status)}</span>
                  <span className={`text-sm font-medium ${getStatusColor(page.status)}`}>
                    {getStatusText(page.status)}
                  </span>
                </div>
              </div>
              
              {page.status === 'completed' && (
                <button
                  onClick={() => togglePageExpansion(page.id)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {expandedPages.has(page.id) ? '▼' : '▶'} 
                  {expandedPages.has(page.id) ? 'Hide' : 'Show'} Translation
                </button>
              )}
            </div>
            
            {/* Page Content */}
            {page.status === 'error' && (
              <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20">
                <p className="text-red-700 dark:text-red-300">
                  Error: {page.error || 'Unknown error occurred'}
                </p>
              </div>
            )}
            
            {page.status === 'completed' && page.result && expandedPages.has(page.id) && (
              <div className="px-6 py-4">
                <TextDisplay
                  texts={page.result.reading_order}
                  pageNumber={page.order}
                />
              </div>
            )}
            
            {(page.status === 'processing' || page.status === 'uploading') && (
              <div className="px-6 py-4 text-center">
                <div className="text-2xl mb-2 animate-spin">⏳</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {page.status === 'uploading' ? 'Uploading file...' : 'Processing with LLM...'}
                </p>
              </div>
            )}
            
            {page.status === 'pending' && (
              <div className="px-6 py-4 text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-gray-600 dark:text-gray-400">Waiting to process...</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}