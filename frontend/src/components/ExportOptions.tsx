'use client';

import { useState } from 'react';
import { createExporter, exportFormats, ExportFormat } from '@/lib/export';

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

interface ExportOptionsProps {
  result: ComicResult;
  filename: string;
}

export default function ExportOptions({ result, filename }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      
      const exporter = createExporter(result, filename);
      exporter.exportAndDownload(format);
      
      // Small delay to show the exporting state
      setTimeout(() => {
        setIsExporting(false);
        setShowOptions(false);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  };

  const exportOptions = [
    {
      format: exportFormats.JSON,
      label: 'JSON',
      description: 'Structured data format for developers',
      icon: '📊',
      color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
    },
    {
      format: exportFormats.TXT,
      label: 'Text',
      description: 'Simple plain text format',
      icon: '📄',
      color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-600'
    },
    {
      format: exportFormats.MARKDOWN,
      label: 'Markdown',
      description: 'Formatted text with headers and styling',
      icon: '📝',
      color: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600'
    }
  ];

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span>📤</span>
            <span>Export</span>
          </>
        )}
      </button>

      {/* Export Options Dropdown */}
      {showOptions && !isExporting && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
              Export Translation
            </h3>
            
            <div className="space-y-2">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className={`w-full p-3 border-2 rounded-md transition-colors hover:bg-opacity-50 ${option.color}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Files will be downloaded with timestamp in filename
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}