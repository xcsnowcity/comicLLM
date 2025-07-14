'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

interface StorageStats {
  total: {
    files: number;
    size: number;
  };
  uploads: {
    files: number;
    size: number;
    sizeFormatted: string;
  };
  results: {
    files: number;
    size: number;
    sizeFormatted: string;
  };
  sessions: {
    files: number;
    size: number;
    sizeFormatted: string;
  };
  exports: {
    files: number;
    size: number;
    sizeFormatted: string;
  };
}

export default function StorageManager() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [duplicates, setDuplicates] = useState<string[][]>([]);
  const [duplicatesScanPerformed, setDuplicatesScanPerformed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const { getStorageStats, findDuplicates, cleanupStorage } = useAppStore();

  const loadStats = async () => {
    setLoading(true);
    try {
      const statsData = await getStorageStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDuplicates = async () => {
    setLoading(true);
    try {
      const duplicatesData = await findDuplicates();
      setDuplicates(duplicatesData.duplicates || []);
      setDuplicatesScanPerformed(true);
    } catch (error) {
      console.error('Failed to find duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    setCleanupLoading(true);
    try {
      await cleanupStorage();
      await loadStats(); // Refresh stats after cleanup
      alert('Storage cleanup completed successfully!');
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
      alert('Storage cleanup failed. Please try again.');
    } finally {
      setCleanupLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Storage Management</h2>
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Storage Statistics */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📊 Storage Usage</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatBytes(stats.total.size)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stats.total.files} files
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400">Uploads</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats.uploads.sizeFormatted}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {stats.uploads.files} files
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm text-green-600 dark:text-green-400">Results</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {stats.results.sizeFormatted}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {stats.results.files} files
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-sm text-purple-600 dark:text-purple-400">Exports</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {stats.exports.sizeFormatted}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {stats.exports.files} files
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Note:</strong> With hash-based deduplication, identical files are only stored once, 
            significantly reducing storage usage compared to traditional systems.
          </div>
        </div>
      )}

      {/* Storage Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🧹 Storage Tools</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Find Duplicate Files</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Scan for duplicate files in the uploads directory
              </div>
            </div>
            <button
              onClick={loadDuplicates}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Scanning...' : 'Find Duplicates'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Clean Up Storage</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Remove orphaned files not referenced by any session
              </div>
            </div>
            <button
              onClick={handleCleanup}
              disabled={cleanupLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {cleanupLoading ? 'Cleaning...' : 'Clean Up'}
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Files Results */}
      {duplicates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            🔍 Duplicate Files Found ({duplicates.length} groups)
          </h3>
          
          <div className="space-y-3">
            {duplicates.map((group, index) => (
              <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Group {index + 1} ({group.length} files)
                </div>
                <div className="space-y-1">
                  {group.map((filename, fileIndex) => (
                    <div key={fileIndex} className="text-sm text-yellow-700 dark:text-yellow-300 font-mono">
                      {filename}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ <strong>Note:</strong> With the new hash-based storage system, these duplicates should be rare. 
              They may exist from before the storage system was implemented.
            </div>
          </div>
        </div>
      )}

      {duplicates.length === 0 && duplicatesScanPerformed && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center text-gray-600 dark:text-gray-400">
            ✅ No duplicate files found! Your storage is efficiently organized.
          </div>
        </div>
      )}
    </div>
  );
}